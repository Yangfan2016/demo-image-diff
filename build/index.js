"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pngjs_1 = require("pngjs");
const config_json_1 = __importDefault(require("./config.json"));
function getRgba(i) {
    return [i, i + 1, i + 2, i + 3];
}
function getAverage(...args) {
    const list = [...args];
    return list.reduce((acc, cur) => {
        acc += cur;
        return acc;
    }, 0) / list.length;
}
function diff(params) {
    const { path1, path2, output, rate } = params;
    const img1 = pngjs_1.PNG.sync.read(fs_1.default.readFileSync(path1));
    const img2 = pngjs_1.PNG.sync.read(fs_1.default.readFileSync(path2));
    const threshold = rate || 0.1 * 256;
    const len = img1.data.length;
    return new Promise((rs, rj) => {
        fs_1.default.createReadStream(path1)
            .pipe(new pngjs_1.PNG())
            .on("parsed", function () {
            //   console.log(this.data);
            for (let i = 0; i < len; i += 4) {
                const [r, g, b, a] = getRgba(i);
                const item1 = [img1.data[r], img1.data[g], img1.data[b], img1.data[a]];
                const item2 = [img2.data[r], img2.data[g], img2.data[b], img2.data[a]];
                const disList = [];
                for (let j = 0; j < item1.length; j++) {
                    const dis = item1[j] - item2[j];
                    disList.push(dis);
                }
                const distance = getAverage(...disList);
                if (distance > threshold) {
                    this.data[r] = 0;
                    this.data[g] = 255;
                    this.data[b] = 0;
                    // this.data[a] = 255;
                }
                else {
                    this.data[r] = 0;
                    this.data[g] = 0;
                    this.data[b] = 0;
                    // this.data[a] = 255;
                }
            }
            this.pack().pipe(fs_1.default.createWriteStream(output));
            rs('done');
        });
    });
}
const diffList = config_json_1.default;
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (var diffList_1 = __asyncValues(diffList), diffList_1_1; diffList_1_1 = yield diffList_1.next(), !diffList_1_1.done;) {
                let item = diffList_1_1.value;
                const { before, after, output } = item;
                diff({
                    path1: path_1.default.resolve(__dirname, before),
                    path2: path_1.default.resolve(__dirname, after),
                    output: path_1.default.resolve(__dirname, output)
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (diffList_1_1 && !diffList_1_1.done && (_a = diffList_1.return)) yield _a.call(diffList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
main();
