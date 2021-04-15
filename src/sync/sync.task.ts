import SyncController from "./sync.controller";
const syncController = new SyncController();



syncController.sync(process.argv[2], process.argv[3])
    .then((pages: any) => {
        process.exit(0);
    })
    .catch((error: any) => {
        process.exit(1);
    });
