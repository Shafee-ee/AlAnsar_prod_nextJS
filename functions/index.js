/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const { onObjectFinalized } = require("firebase-functions/v2/storage");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const sharp = require("sharp");
const pdf = require("pdf-poppler");

admin.initializeApp();

exports.convertPdfToImages = onObjectFinalized(
    {
        bucket: "alansarweekly-a8d84.appspot.com",
    },
    async (event) => {
        const filePath = event.data.name;

        if (!filePath.endsWith("original.pdf")) {
            return;
        }

        const bucket = admin.storage().bucket();
        const tempFilePath = path.join(os.tmpdir(), "original.pdf");

        await bucket.file(filePath).download({ destination: tempFilePath });

        const outputDir = path.join(os.tmpdir(), "pages");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const opts = {
            format: "jpeg",
            out_dir: outputDir,
            out_prefix: "page",
            page: null,
        };

        await pdf.convert(tempFilePath, opts);

        const files = fs.readdirSync(outputDir);

        const slug = filePath.split("/")[1];
        let pageCount = 0;

        for (const file of files) {
            const inputPath = path.join(outputDir, file);
            const webpPath = inputPath.replace(".jpg", ".webp");

            await sharp(inputPath).webp({ quality: 80 }).toFile(webpPath);

            const pageNumber = file.match(/\d+/)[0];

            await bucket.upload(webpPath, {
                destination: `digipaper/${slug}/pages/page-${pageNumber}.webp`,
            });

            pageCount++;
        }

        await admin.firestore().collection("digipaper_issues").doc(slug).update({
            totalPages: pageCount,
            status: "ready",
        });

        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.unlinkSync(tempFilePath);
    }
);


