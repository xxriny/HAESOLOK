const fs = require("fs");

function normalizeReadlinkError(error) {
  if (error && error.code === "EISDIR" && process.platform === "win32") {
    error.code = "EINVAL";
  }
  return error;
}

const readlinkSync = fs.readlinkSync;
fs.readlinkSync = function patchedReadlinkSync(...args) {
  try {
    return readlinkSync.apply(this, args);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

const readlink = fs.readlink;
fs.readlink = function patchedReadlink(...args) {
  const callback = args[args.length - 1];

  if (typeof callback !== "function") {
    return readlink.apply(this, args).catch((error) => {
      throw normalizeReadlinkError(error);
    });
  }

  args[args.length - 1] = (error, result) => {
    callback(normalizeReadlinkError(error), result);
  };

  return readlink.apply(this, args);
};

if (fs.promises?.readlink) {
  const promisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function patchedPromisesReadlink(...args) {
    try {
      return await promisesReadlink.apply(this, args);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };
}
