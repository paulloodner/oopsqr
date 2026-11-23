/**
 * Correctif pour les systèmes de fichiers Windows qui renvoient EISDIR au lieu
 * de EINVAL quand readlink() est appelé sur un fichier normal. Webpack traite
 * EISDIR comme une erreur fatale ; on normalise donc le code d'erreur.
 */
const fs = require("node:fs");

function invalidArgument(path) {
  const error = new Error(`EINVAL: invalid argument, readlink '${path}'`);
  error.code = "EINVAL";
  error.errno = -22;
  error.syscall = "readlink";
  error.path = path;
  return error;
}

const originalSync = fs.readlinkSync;
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  if (typeof options === "function") {
    // signature invalide, laisser Node gérer
    return originalSync.apply(fs, arguments);
  }
  try {
    return originalSync.call(fs, path, options);
  } catch (error) {
    if (error && error.code === "EISDIR") throw invalidArgument(path);
    throw error;
  }
};

const original = fs.readlink;
fs.readlink = function patchedReadlink(path, options, callback) {
  let opts = options;
  let cb = callback;
  if (typeof options === "function") {
    cb = options;
    opts = undefined;
  }
  if (typeof cb !== "function") {
    return original.apply(fs, arguments);
  }
  return original.call(fs, path, opts, (error, link) => {
    if (error && error.code === "EISDIR") {
      cb(invalidArgument(path));
      return;
    }
    cb(error, link);
  });
};

const originalPromise = fs.promises.readlink;
fs.promises.readlink = async function patchedPromiseReadlink(path, options) {
  try {
    return await originalPromise.call(fs.promises, path, options);
  } catch (error) {
    if (error && error.code === "EISDIR") throw invalidArgument(path);
    throw error;
  }
};
