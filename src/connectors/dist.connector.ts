
import {RenderEnv} from "config";
import {DIST_FOLDER} from "../util/config";

import logger from '../util/logger';
// @ts-ignore
import client from 'scp2';

import Rsync from 'rsync';


import rmrf from "rmrf";


export class DistConnector {

    constructor() {}


    async sync(renderEnv: RenderEnv) {

        const rsync = new Rsync();
        rsync.shell('ssh');
        rsync.flags('avz');
        rsync.set('delete');
        rsync.source(DIST_FOLDER + renderEnv.RENDER_ENVIRONMENT + '/');
        rsync.destination(renderEnv.REMOTE_HOST + ':' + renderEnv.REMOTE_PATH)

        return new Promise ((resolve,reject) => {
            try {
                let logData = "";
                rsync.execute(
                    (error, code, cmd) => {
                        resolve({error, code, cmd, data: logData})
                    },
                    (data) => {
                        logData += data;
                    },
                    (err) => {
                        logData += err;
                    }
                );
            } catch (error) {
                reject(error);
            }
        })
    }


    // async delete(path,renderEnv) {
    //
    //     let sftp = new Client();
    //
    //     let originPath,distPath, remoteDir,clientConfig;
    //
    //
    //     switch (renderEnv) {
    //
    //         case 'amstelveenlijn':
    //
    //             clientConfig = {
    //                 host: '185.214.149.104',
    //                 port: '22',
    //                 username: 'root',
    //                 password: 'c9c0b37f3938b16a8d8e447934621354'
    //             };
    //
    //             distPath = (path === 'amstelveenlijn') ? '/' : path.replace('amstelveenlijn/', '/');
    //             remoteDir = '/var/www/vhosts/amstelveenlijn.nl/httpdocs/static';
    //
    //             break;
    //
    //         case 'uithoornlijn':
    //
    //             clientConfig = {
    //                 host: '185.214.149.56',
    //                 port: '22',
    //                 username: 'root',
    //                 password: 'fe7d871f687c50a6b05297d2b21611e2'
    //             };
    //
    //             distPath = (path === 'uithoornlijn') ? '/' : path.replace('uithoornlijn/', '/');
    //             remoteDir = '/var/www/vhosts/wijnemenjemee.nl/uithoornlijn.nl' + distPath;
    //
    //             break;
    //
    //         case 'amsteltram':
    //
    //             clientConfig = {
    //                 host: '185.214.149.56',
    //                 port: '22',
    //                 username: 'root',
    //                 password: 'fe7d871f687c50a6b05297d2b21611e2'
    //             };
    //
    //             distPath = (path === 'amsteltram') ? '/' : path.replace('amsteltram/', '/');
    //             remoteDir = '/var/www/vhosts/wijnemenjemee.nl/amsteltram.nl' + distPath;
    //
    //             break;
    //
    //     }
    //
    //     let client = new Client();
    //
    //     client.connect(clientConfig)
    //         .then(() => {
    //             return client.rmdir(remoteDir, true);
    //         })
    //         .then(() => {
    //             return client.end();
    //
    //         })
    //         .catch(err => {
    //             logger.error(err.message);
    //
    //         });
    //
    //     return;
    //
    // }
    //
    // copyDataset(path,renderEnv) {
    //
    //     let originPath,distPath,distServer;
    //
    //
    //     return new Promise((resolve, reject) => {
    //
    //         switch (renderEnv) {
    //
    //
    //
    //             case 'amstelveenlijn':
    //
    //                 originPath = config.dist + path + '/dataset.json';
    //                 distPath = (path === 'amstelveenlijn') ? '/' : path.replace('amstelveenlijn/', '/');
    //                 distPath = (distPath === 'nieuwe-homepage') ? '/' : distPath.replace('nieuwe-homepage', '');
    //
    //                 distServer = 'root:cfM$309sfMcQ9MdNE@82.150.142.144:/var/www/vhosts/amstelveenlijn.nl/subdomains/test' + distPath;
    //
    //                 break;
    //
    //             case 'uithoornlijn':
    //
    //                 originPath = (path === 'uithoornlijn') ? config.dist + path + '/dataset.json' : config.dist + path + '/';
    //                 distPath = (path === 'uithoornlijn') ? '/' : path.replace('uithoornlijn/', '/');
    //                 distServer = 'root:0RA_VGh$epA3bvAeP@82.150.142.107:/var/www/vhosts/wijnemenjemee.nl/uithoornlijn.nl' + distPath;
    //
    //                 break;
    //
    //             case 'amsteltram':
    //
    //                 originPath = (path === 'amsteltram') ? config.dist + path + '/dataset.json' : config.dist + path + '/';
    //                 distPath = (path === 'amsteltram') ? '/' : path.replace('amsteltram/', '/');
    //                 distServer = 'root:0RA_VGh$epA3bvAeP@82.150.142.107:/var/www/vhosts/wijnemenjemee.nl/amsteltram.nl' + distPath;
    //
    //                 break;
    //         }
    //
    //         scp.scp(originPath, distServer, function (error) {
    //             if (error) {
    //                 logger.error(error);
    //             }
    //             resolve();
    //         });
    //     });
    //
    // }
    //
    // copyWorks() {
    //
    //     let originPath = config.dist + path + '/dataset.json';
    //     let distPath = (path === 'amstelveenlijn') ? '/' : path.replace('amstelveenlijn/', '/');
    //     let distServer = 'root:cfM$309sfMcQ9MdNE@82.150.142.144:/var/www/vhosts/amstelveenlijn.nl/subdomains/test' + distPath;
    //
    //     scp.scp(originPath, distServer, function (error) {
    //         if (error) {
    //             logger.error(error);
    //         }
    //         resolve();
    //     });
    // }
}
