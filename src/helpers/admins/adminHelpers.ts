import mongoose from 'mongoose';
import { config } from '../../config/index';
import { Admin } from '../../models';
import { generateToken, verifyToken } from '../../utils';
import { generatePassword } from '../../functions';
import { ThrowError } from '../../classes';
import { IRoles } from '../../types/default';

const { isValidObjectId } = mongoose;
const { NODE_ENV } = config.SERVER;

/**
 * To get all admins
 * @returns {Admins} admins
 */
export const getAdmins = (role?: IRoles) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = ['SuperAdmin', 'Developer'].includes(role ?? '')
        ? { isDeleted: true }
        : {};
      const admins = await Admin.find({ ...query }).sort({ createdAt: -1 });

      resolve({
        message: 'Admins Fetched',
        admins,
      });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To get a particular admin by id
 * @param {String} adminId
 * @returns {Admin} admin
 */
export const getAdmin = (adminId: string, role?: IRoles) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide vaild admin id', 404);

      const query = ['SuperAdmin', 'Developer'].includes(role ?? '')
        ? { isDeleted: true }
        : {};
      const admin = await Admin.findOne({ _id: adminId, ...query });

      if (!admin) {
        return reject({
          message: 'Admin not found',
          statusCode: 404,
        });
      }
      resolve({ message: 'Admin fetched', admin });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To login a admin's account by email and password
 * @param {String} email
 * @param {String} username
 * @param {String} phone
 * @param {String} password
 * @returns {String} token
 */
export const adminLogin = (email: string, phone: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if ((!email && !phone) || !password)
        throw new ThrowError('Provide email or phone and password', 400);

      const admin = await Admin.findOne(
        { $or: [{ email }, { phone }] },
        { password: 1, name: 1, role: 1, status: 1, lastSync: 1 }
      );

      if (!admin)
        throw new ThrowError(
          `Invalid ${!email ? 'Phone' : 'Email'} or Password`,
          400
        );
      if (admin.status === 'Blocked')
        throw new ThrowError(`Account blocked! contact Customer Care`, 401);

      if (admin && (await admin.matchPassword(password))) {
        if (admin.status === 'Inactive') admin.status = 'Active';
        admin.lastSync = new Date();
        await admin.save();

        const token = await generateToken({
          id: admin._id.toString(),
          name: admin.name,
          role: admin.role,
          type: 'AccessToken',
        });
        resolve({
          message: 'Login Success',
          token,
        });
      } else {
        throw new ThrowError(
          `Invalid ${!email ? 'Phone' : 'Email'} or Password`,
          400
        );
      }
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To add a new admin
 * @param {Admin} data
 * @returns admin
 */
export const addAdmin = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        role = 'Admin',
        password,
        pincode,
      } = data;
      if (!name || !email || !phone)
        throw new ThrowError(
          'Please Provide name, email, role,  phone, address and password',
          400
        );

      const adminExists = await Admin.findOne({
        $or: [{ email }, { phone }],
        role,
      });

      if (adminExists) throw new ThrowError('Admin already exist!', 401);

      const adminPassword = password || generatePassword();
      const autoGeneratedPasswd = password ? false : true;
      const admin = await new Admin({
        name,
        email,
        phone,
        role: role || 'Admin',
        password: adminPassword,
        autoGeneratedPasswd,
        lastSync: new Date(),
        lastUsed: new Date(),
      });

      if (pincode) admin.pincode = pincode;
      if (address) admin.address = address;
      const nadmin = await admin.save();

      // sendMail("SendCredentials", {
      //   name: nadmin.name,
      //   email: nadmin.email,
      //   phone: nadmin.phone,
      //   role: nadmin.role,
      //   password: adminPassword,
      // })
      //   .then()
      //   .catch();

      resolve({ message: 'Account created successfully', admin: nadmin });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To edit a admin
 * @param {String} adminId
 * @param {Admin} data
 * @returns
 */
export const editAdmin = (adminId: string, data: any, client: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide vaild admin id', 400);

      const admin = await Admin.findById(adminId);

      if (!admin) throw new ThrowError('Admin not found', 404);

      const { name, address, phone, password, email, pincode } = data;

      // New email is already exist from another admin then
      if (email && admin.email != email) {
        const adminExists = await Admin.findOne({ email, role: admin.role });
        if (adminExists)
          throw new ThrowError('Email already exist for other admin', 400);
      }

      // New phone is already exist from another admin then
      if (phone && admin.phone != phone) {
        const adminExists = await Admin.findOne({ phone, role: admin.role });
        if (adminExists)
          throw new ThrowError('Phone already exist for other admin', 400);
      }

      // Update a values in db
      admin.name = name || admin.name;
      admin.email = email || admin.email;
      admin.phone = phone || admin.phone;
      admin.address = address || admin.address;
      admin.pincode = pincode || admin.pincode;

      if (password) {
        admin.password = password;
        // sendMail("SendCredentials", {
        //   name: admin.name,
        //   email: admin.email,
        //   phone: admin.phone,
        //   role: admin.role,
        //   password: password,
        // })
        //   .then()
        //   .catch();
      }

      const nadmin = await admin.save();

      resolve({ message: 'Admin edited successfully', admin: nadmin });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To update a admin profile
 * @param {String} adminId
 * @param {Admin} data
 * @returns
 */
export const updateAdminProfile = (adminId: string, data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide vaild admin id', 400);

      const admin = await Admin.findById(adminId);

      if (!admin) throw new ThrowError('Admin not found', 404);

      const { name, address, pincode } = data;

      // Update a values in db
      admin.name = name || admin.name;
      admin.address = address || admin.address;
      admin.pincode = pincode || admin.pincode;

      const nadmin = await admin.save();

      resolve({ message: 'Admin profile updated successfully', admin: nadmin });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To send a login credentials to admin's email
 * @param {String} adminId
 * @returns
 */
export const sentLoginCredentials = (adminId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide vaild admin id', 400);

      const admin = await Admin.findById(adminId);

      if (!admin) throw new ThrowError('Admin not found', 404);

      const adminPassword = generatePassword();
      admin.password = adminPassword;
      console.log(admin.password);
      await admin.save();

      // sendMail("SendCredentials", {
      //   name: admin.name,
      //   email: admin.email,
      //   phone: admin.phone,
      //   role: admin.role,
      //   password: adminPassword,
      // })
      //   .then()
      //   .catch();

      resolve({ message: "Login credential sended to admin's mail" });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To check the admin status
 * @param {String} adminId
 * @returns {Admin} admin
 */
export const checkAdminStatus = (adminId: string, status: string[]) => {
  return new Promise<{ message: string; admin: any }>(
    async (resolve, reject) => {
      try {
        if (!adminId || !isValidObjectId(adminId) || status.length <= 0)
          throw new ThrowError('Provide vaild admin id and status', 400);

        const admin = await Admin.findOne({ _id: adminId, isDeleted: false });

        if (!admin) throw new ThrowError('Admin not found', 404);

        if (admin.status === 'Inactive') admin.status = 'Active';
        admin.lastUsed = new Date();
        await admin.save();

        if (status.includes(admin.status)) {
          return resolve({
            message: `Admin is ${admin.status}`,
            admin: {
              id: admin._id,
              name: admin.name,
              role: admin.role,
              status: admin.status,
            },
          });
        }
        reject({ message: `Admin is ${admin.status}` });
      } catch (error: any) {
        return reject({
          message: error.message || error.msg,
          statusCode: error.statusCode,
          code: error.code || error.name,
        });
      }
    }
  );
};

/**
 * To change admin password
 * @param {String} adminId
 * @param {Passwords} data
 * @returns
 */
export const changeAdminPassword = (adminId: string, data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { currentPassword, password } = data;

      if (
        !adminId ||
        !isValidObjectId(adminId) ||
        !password ||
        !currentPassword
      )
        throw new ThrowError(
          'Provide vaild admin id, currentPassword and password',
          400
        );

      const admin = await Admin.findOne({ _id: adminId }, { password: 1 });

      if (!admin) throw new ThrowError('Admin not found', 404);

      const isMatch = await admin.matchPassword(admin.password!);
      if (isMatch) {
        if (admin.autoGeneratedPasswd) admin.autoGeneratedPasswd = false;
        admin.password = password;

        await admin.save();

        return resolve({ message: 'Password Changed Successfully' });
      } else {
        return reject({ message: 'Incorrect Credential' });
      }
    } catch (error: any) {
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To change a admins status
 * @param {String} adminId
 * @param {String} status
 * @returns {Admin} admin
 */
export const changeAdminStatus = (adminId: string, status: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !adminId ||
        !isValidObjectId(adminId) ||
        !['Active', 'Inactive', 'Blocked'].includes(status)
      )
        throw new ThrowError('Provide vaild admin id and status', 404);

      const admin = await Admin.findById(adminId);

      if (!admin) throw new ThrowError('Admin not found', 404);

      admin.status = status;

      const nadmin = await admin.save();

      resolve({
        message: `${nadmin.name} status changed to ${nadmin.status}`,
        admin: nadmin,
      });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To change a email for admin
 * @param {String} adminId
 * @param {String} email
 * @returns {Admin} admin
 */
export const changeAdminEmail = (adminId: string, email: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId) || !email)
        throw new ThrowError('Provide vaild admin id and email', 400);

      const admin = await Admin.findById(adminId);

      if (!admin) throw new ThrowError('Admin not found', 404);

      if (admin.email === email)
        throw new ThrowError('Old and new email must be different', 400);

      const adminExists = await Admin.findOne({
        _id: { $ne: adminId },
        email,
        role: admin.role,
      });
      if (adminExists)
        throw new ThrowError('Email already exist for other admin', 400);

      admin.email = email;

      const nadmin = await admin.save();

      resolve({
        message: `${nadmin.name}'s email changed to ${nadmin.email}`,
        admin: nadmin,
      });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To change a phone for admin
 * @param {String} adminId
 * @param {String} phone
 * @returns {Admin} admin
 */
export const changeAdminPhone = (adminId: string, phone: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId) || !phone) {
        return reject({
          message: 'Provide vaild admin id and phone',
          statusCode: 404,
        });
      }

      const admin = await Admin.findById(adminId);
      if (!admin) throw new ThrowError('Admin not found', 404);

      if (admin.phone === phone)
        throw new ThrowError('Old and new phone must be different', 400);

      const adminExists = await Admin.findOne({
        _id: { $ne: adminId },
        phone,
        role: admin.role,
      });
      if (adminExists)
        throw new ThrowError('Phone number already exist for other admin', 400);

      admin.phone = phone;

      const nadmin = await admin.save();

      resolve({
        message: `${nadmin.name}'s phone changed to ${nadmin.phone}`,
        admin: nadmin,
      });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To send a reset link to email
 * @param {String} email
 * @returns
 */
export const forgotAdminPassword = (email: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) throw new ThrowError('Please Provide Email', 400);

      const admin = await Admin.findOne({ email });
      let token: string = '';
      if (admin) {
        admin.resetPasswordAccess = true;
        await admin.save();

        token = await generateToken({
          id: admin._id.toString(),
          name: admin.name,
          role: 'Admin',
          type: 'ResetToken',
        });

        console.log(token);

        // await sendMail("ResetPassword", {
        //   token,
        //   name: admin.name,
        //   email: admin.email,
        // })
        //   .then()
        //   .catch();
      }
      resolve({
        message:
          'If your email exist,then the Password reset link will be sent to your email',
      });
    } catch (error: any) {
      return reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To reset a password using token
 * @param {String} token
 * @param {String} password
 * @returns
 */
export const resetAdminPassword = (token: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token || !password)
        throw new ThrowError('Please Provide Token and Password', 400);
      const decoded = await verifyToken(token, 'ResetToken');

      if (decoded && decoded.id) {
        const adminFound = await Admin.findOne(
          {
            _id: decoded.id,
            resetPasswordAccess: true,
          },
          {
            password: 1,
            resetPasswordAccess: 1,
          }
        );
        if (adminFound) {
          const isMatch = await adminFound.matchPassword(password);
          if (isMatch) {
            throw new ThrowError('New Pasword and Old Password is Same', 400);
          } else {
            adminFound.password = password;
            adminFound.resetPasswordAccess = false;
            await adminFound.save();
            return resolve({ message: 'Password Reset Successfully' });
          }
        } else {
          throw new ThrowError('Reset Password Permission Denied', 401);
        }
      } else {
        throw new ThrowError('Incorrect Credentials', 401);
      }
    } catch (error: any) {
      console.log(error);
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To delete a non deleted admin temporarily
 * @param {String} adminId
 */
export const deleteAdmin = (adminId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide valid admin id', 400);

      const admin = await Admin.findOne({
        _id: adminId,
        isDeleted: false,
      });

      if (!admin) throw new ThrowError('Admin not found', 404);

      admin.status = 'Inactive';
      admin.isDeleted = true;
      admin.deletedAt = new Date();

      await admin.save();

      resolve({
        message: `${admin.name} admin was deleted`,
      });
    } catch (error: any) {
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To restore a deleted admin
 * @param {String} adminId
 * @returns admin
 */
export const restoreAdmin = (adminId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide valid admin id', 400);

      const admin = await Admin.findOne({
        _id: adminId,
        isDeleted: true,
      });

      if (!admin) {
        return reject({
          message: 'Admin not found',
          statusCode: 404,
        });
      }

      admin.status = 'Active';
      admin.isDeleted = false;
      admin.deletedAt = undefined;

      const nadmin = await admin.save();

      resolve({
        message: `${nadmin.name} admin was restored`,
        admin: nadmin,
      });
    } catch (error: any) {
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To delete a admin permanently
 * @param {String} adminId
 */
export const pDeleteAdmin = (adminId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!adminId || !isValidObjectId(adminId))
        throw new ThrowError('Provide valid admin id', 400);

      const admin = await Admin.findOne({
        _id: adminId,
        isDeleted: true,
      });

      if (!admin) {
        return reject({
          message: 'Admin not found',
          statusCode: 404,
        });
      }

      if (NODE_ENV === 'development') {
        await admin.deleteOne();
        return resolve({ message: `${admin.name} admin was deleted` });
      }
      throw new ThrowError(`Not able to delete admin in ${NODE_ENV} mode`, 401);
    } catch (error: any) {
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};

/**
 * To delete all admin in development mode
 */
export const deleteAllAdmin = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (NODE_ENV === 'development') {
        await Admin.deleteMany({});
        return resolve({ message: 'All admin deleted' });
      }
      throw new ThrowError(
        `Not able to delete all admins in ${NODE_ENV} mode`,
        401
      );
    } catch (error: any) {
      reject({
        message: error.message || error.msg,
        statusCode: error.statusCode,
        code: error.code || error.name,
      });
    }
  });
};
