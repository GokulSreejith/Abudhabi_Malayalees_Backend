import { ErrorResponse } from "../../classes";
import { deleteS3File } from "../../functions/s3";
import { galleryHelpers } from "../../helpers";

import { ApiParams } from "../../types";

/**
 * Get all gallerys
 * METHOD : GET
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const getGallerys: ApiParams = (req, res, next) => {
  galleryHelpers
    .getGallerys()
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
        data: resp.gallerys,
      });
    })
    .catch((error: any) => {
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};

/**
 * Get all gallerys for customer
 * METHOD : GET
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const getGallerysForCustomer: ApiParams = (req, res, next) => {
  galleryHelpers
    .getGallerysForCustomer()
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
        data: resp.gallerys,
      });
    })
    .catch((error: any) => {
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};

/**
 * Get a particular gallery
 * METHOD : GET
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const getGallery: ApiParams = (req, res, next) => {
  galleryHelpers
    .getGallery(req.params.cid, req.client!.role)
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
        data: resp.gallery,
      });
    })
    .catch((error: any) => {
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};

/**
 * To Signup a new gallery
 * METHOD : POST
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const addGallery: ApiParams = (req, res, next) => {
  req.body.image = req.file;
  galleryHelpers
    .addGallery(req.body)
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
        gallery: resp.gallery,
      });
    })
    .catch((error: any) => {
      if (req.file) {
        deleteS3File(req.file.key);
      }
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};

/**
 * To edit a gallery
 * METHOD : PATCH
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const editGallery: ApiParams = (req, res, next) => {
  req.body.image = req.file;
  galleryHelpers
    .editGallery(req.params.cid, req.body, req.client)
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
        data: resp.gallery,
      });
    })
    .catch((error: any) => {
      if (req.file) {
        deleteS3File(req.file.key);
      }
      return next(new ErrorResponse(error.message, 402, error.code));
    });
};

/**
 * To change gallery visibility
 * METHOD : PATCH
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const changeGalleryVisibility: ApiParams = (req, res, next) => {
  galleryHelpers
    .changeGalleryVisibility(req.params.cid)
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
      });
    })
    .catch((error: any) => {
      return next(new ErrorResponse(error.message, 402, error.code));
    });
};

/**
 * To delete a non deleted gallery temporarily
 * METHOD : DELETE
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const deleteGallery: ApiParams = (req, res, next) => {
  galleryHelpers
    .deleteGallery(req.params.cid)
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
      });
    })
    .catch((error: any) => {
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};

/**
 * To delete all gallery
 * METHOD : DELETE
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const deleteAllGallery: ApiParams = (req, res, next) => {
  galleryHelpers
    .deleteAllGallery()
    .then((resp: any) => {
      res.status(200).json({
        success: true,
        message: resp.message,
      });
    })
    .catch((error: any) => {
      return next(
        new ErrorResponse(error.message, error.statusCode, error.code)
      );
    });
};
