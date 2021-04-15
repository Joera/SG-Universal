import BulkController from "./bulk.controller";
const bulkController = new BulkController();

bulkController.render(process.argv[2], process.argv[3], process.argv[4])
    .then((pages: any) => {
        process.exit(0);
    })
    .catch((error: any) => {
        process.exit(1);
    });
