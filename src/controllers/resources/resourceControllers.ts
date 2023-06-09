import { ErrorResponse } from "../../classes";
import { config } from "../../config";
import { getS3File } from "../../functions/s3";
import { ApiParams } from "../../types";

const {
  AWS_S3_ADZ_RESOURCES,
  AWS_S3_CATEGORY_RESOURCES,
  AWS_S3_GALLERY_RESOURCES,
  AWS_S3_EVENT_RESOURCES,
  AWS_S3_BUSINESS_ACCOUNT_GALLERY_RESOURCES,
  AWS_S3_BUSINESS_ACCOUNT_PROFILE_RESOURCES,
  AWS_S3_PERSONAL_ACCOUNT_GALLERY_RESOURCES,
  AWS_S3_PERSONAL_ACCOUNT_PROFILE_RESOURCES,
  AWS_S3_NEWS_RESOURCES,
} = config.AWS_S3;

export const getResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, "/");

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getPathResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;
    const path = req.params.path;

    const image: any = await getS3File(key, path);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getAdvertisementResourceByKey: ApiParams = async (
  req,
  res,
  next
) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, AWS_S3_ADZ_RESOURCES);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getCategoryResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, AWS_S3_CATEGORY_RESOURCES);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getGalleryResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, AWS_S3_GALLERY_RESOURCES);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getEventResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, AWS_S3_EVENT_RESOURCES);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getNewsResourceByKey: ApiParams = async (req, res, next) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(key, AWS_S3_NEWS_RESOURCES);

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getBusinessAccountGalleryResourceByKey: ApiParams = async (
  req,
  res,
  next
) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(
      key,
      AWS_S3_BUSINESS_ACCOUNT_GALLERY_RESOURCES
    );

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getBusinessAccountProfilePictureResourceByKey: ApiParams = async (
  req,
  res,
  next
) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(
      key,
      AWS_S3_BUSINESS_ACCOUNT_PROFILE_RESOURCES
    );

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getPersonalAccountGalleryResourceByKey: ApiParams = async (
  req,
  res,
  next
) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(
      key,
      AWS_S3_PERSONAL_ACCOUNT_GALLERY_RESOURCES
    );

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};

export const getPersonalAccountProfilePictureResourceByKey: ApiParams = async (
  req,
  res,
  next
) => {
  try {
    const key = req.params.key;

    const image: any = await getS3File(
      key,
      AWS_S3_PERSONAL_ACCOUNT_PROFILE_RESOURCES
    );

    image.pipe(res);
  } catch (error: any) {
    return next(new ErrorResponse(error.message, error.statusCode, error.code));
  }
};
