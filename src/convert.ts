import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const resouresPath = path.resolve(__dirname, "../assets");

const width=500;
const height=322;
const fileprefix="p6";
var dst = new PNG({ width, height });
fs.createReadStream(path.join(resouresPath, `${fileprefix}.png`))
    .pipe(new PNG())
    .on("parsed", function () {
        this.bitblt(dst, 0, 0, width, height, 0, 0);
        dst.pack().pipe(fs.createWriteStream(path.join(resouresPath,`${fileprefix}-2.png`)));
    });