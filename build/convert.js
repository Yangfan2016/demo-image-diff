"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pngjs_1 = require("pngjs");
const resouresPath = path_1.default.resolve(__dirname, "../assets");
const width = 500;
const height = 322;
const fileprefix = "p6";
var dst = new pngjs_1.PNG({ width, height });
fs_1.default.createReadStream(path_1.default.join(resouresPath, `${fileprefix}.png`))
    .pipe(new pngjs_1.PNG())
    .on("parsed", function () {
    this.bitblt(dst, 0, 0, width, height, 0, 0);
    dst.pack().pipe(fs_1.default.createWriteStream(path_1.default.join(resouresPath, `${fileprefix}-2.png`)));
});
