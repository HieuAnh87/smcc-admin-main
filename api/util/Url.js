import * as FbAccountRepo from "../repositories/FbAccount.repo.js";
import * as constants from "../config/constants.js";
// import browser from "../../crawler/crawlFacebook/bin/browser/index.js";
// import { login } from "../../crawler/crawlFacebook/bin/actions/index.js";
import { PrismaClient } from "../../lib/index.js";
import { checkPostUrl, getGroupsOfAccount } from "../../lib/facebook/index.js";

const prisma = new PrismaClient();

export const verifyUrl = (url) => {
  try {
    return new URL(url);
  } catch(err) {
    return null;
  }
}

// export const checkFBSourcesType = async (facebookLinks) => {
//   let page = null;
//   try {
//     const validLinks = [];
//     const invalidLinks = [];
//     // Get all live accounts from DB
//     let accounts = await FbAccountRepo.findAll('LIVE', 0, 10, constants.DEFAULT_ORDER_BY_ATR, constants.DEFAULT_ORDER_BY_TYPE);
//     let loginSuccessful = false;
//     do {
//         // Get a random account to login
//         const accIdx = Math.floor(Math.random() * accounts.length);
//         accounts[accIdx].id = accounts[accIdx]._id;
//         // Create browser
//         page = await browser.initialize(accounts[accIdx]);
//         if (!page) {
//           accounts.splice(accIdx, 1);
//           continue;
//         }
//         // Set cookies if already has cookies
//         if (accounts[accIdx].cookies && accounts[accIdx].cookies.length) {
//           await page.setCookie(...accounts[accIdx].cookies);
//         }
//         // Login to facebook account
//         loginSuccessful = await login(page, accounts[accIdx], prisma);
//         console.log('-----login success 1: ', loginSuccessful)
//         // Save cookies
//         if (loginSuccessful) {
//           console.log('-----login success 2: ')
//           const cookies = JSON.stringify(await page.cookies());
//           console.log('-----login success 3: ')
//           accounts[accIdx].cookies = cookies;
//           await FbAccountRepo.update(accounts[accIdx].id, accounts[accIdx]);
//           console.log('-----login success 4: ')
//         }
//         accounts.splice(accIdx, 1);
//     } while (accounts.length > 0 && !loginSuccessful);
      
//     if (page && loginSuccessful) {
//       console.log('-----login success')
//       for (const link of facebookLinks) {
//         console.log('-----Goto link: ', link)
//         // START: Check source type and get source info
//         const source = {};
//         const response = await page.goto(link, {
//           waitUntil: 'networkidle0',
//           timeout: 0
//         })
//         const responseText = await response.text();
//         console.log('-----go here 1: ')

//         let matchReg = responseText.match(/groupid=[0-9].*?\&/i) || responseText.match(/groupID:\"[0-9].*?\"/i);
//         console.log('-----go here 2: ')
//         // Get group info
//         if (matchReg && matchReg.length) {
//           console.log('-----Get group info 1')
//           // Get group's id
//           const result = matchReg[0].match(/[0-9]{2,}/i);
//           if (result && result.length) {
//             source.id = result[0];
//           } else {
//             invalidLinks.push(link);
//             continue;
//           }
//           // TODO: Get group's name
//           const title = responseText.match(/\<title\>.*?\<\/title\>/i)[0];
//           source.name = title.substring(title.indexOf('\>') + 1, title.lastIndexOf('\<\/'));
//           // Get group's avatar
//           source.avatar = await page.$eval('div[data-mcomponent="ServerImageArea"] > img', img => {
//             return img.getAttribute('src');
//           });
//           source.link = link;
//           source.type = 'FB_GROUP';
//           source.status = 'LIVE';
//           matchReg = null;
//         } else {
//           matchReg = responseText.match(/pageID:\"[0-9]*\"/i);
//           console.log('-----go here 3: ')
//         }

//         // Get page info
//         if (matchReg && matchReg.length) {
//           console.log('-----Get page info 1')
//           // Get page's id
//           const result = matchReg[0].match(/[0-9]{10,}/i);
//           if (result && result.length) {
//             source.id = result[0];
//           } else {
//             invalidLinks.push(link);
//             continue;
//           }
//           // Get page's name
//           const title = responseText.match(/\<title\>.*?\<\/title\>/i)[0];
//           source.name = title.substring(title.indexOf('\>') + 1, title.lastIndexOf('\<\/'));
//           // Get page's avatar
//           source.avatar = await page.$$eval('div[data-mcomponent="ServerImageArea"] > img', imgs => {
//             return imgs[1].getAttribute('src');
//           });
//           source.link = link;
//           source.type = 'FB_PAGE';
//           source.status = 'LIVE';
//           matchReg = null;
//         } else {
//           matchReg = responseText.match(/\;id=[0-9]{10,}/i);
//           console.log('-----go here 4: ')
//         }

//         // Get user info
//         if (matchReg && matchReg.length) {
//           console.log('-----Get user info 1')
//           // Get user's id
//           const result = matchReg[0].match(/[0-9]{10,}/i);
//           if (result && result.length) {
//             source.id = result[0];
//           } else {
//             invalidLinks.push(link);
//             continue;
//           }
//           // Get user's name
//           const title = responseText.match(/\<title\>.*?\<\/title\>/i)[0];
//           source.name = title.substring(title.indexOf('\>') + 1, title.lastIndexOf('\<\/'));
//           // Get user's avatar
//           source.avatar = await page.$eval('img[class="img contain rounded"]', img => {
//             return img.getAttribute('src');
//           });
//           source.link = link;
//           source.type = 'FB_ACCOUNT';
//           source.status = 'LIVE';
//           matchReg = null;
//         } else {
//           matchReg = responseText.match(/\"litelink:.*?\"/i);
//           console.log('-----go here 5: ')
//         }
//         console.log('-----matchReg: ', matchReg[0])
//         if (matchReg && matchReg.length) {
//           // Get source's id
//           const result = matchReg[0].match(/[0-9]{10,}/i);
//           if (result && result.length) {
//             source.id = result[0];
//           } else {
//             invalidLinks.push(link);
//             continue;
//           }
//           console.log('-----Get source info by litelink: ', source.id)
//           source.link = link;
//           source.status = 'LIVE';
//           // Get source's name
//           const title = responseText.match(/\<title\>.*?\<\/title\>/i)[0];
//           source.name = title.substring(title.indexOf('\>') + 1, title.lastIndexOf('\<\/'));
//           console.log('-----Get source info by litelink2: ', source.id, ' ,link: ', source.link, ' ,status: ', source.status, ' ,name: ', source.name)
//           if (response.request().frame().url().indexOf('\/groups\/') > -1) {
//             console.log('-----Get group info 2')
//             // Get group's avatar
//             source.avatar = await page.$eval('div[data-mcomponent="ServerImageArea"] > img', img => {
//               return img.getAttribute('src');
//             });
//             source.type = 'FB_GROUP';
//           } else {
//             console.log('-----go here 5: ')
//             let img = null;
//             try {
//               img = await page.$eval('img[class="img contain rounded"]', element => {
//                 return element.getAttribute('src');
//               });
//             } catch(err) {
//               console.log(err);
//             }
//             if (img) {
//               console.log('-----Get user info 2')
//               // Get user's avatar
//               source.avatar = img;
//               source.type = 'FB_ACCOUNT';
//             } else {
//               console.log('-----Get page info 2')
//               // Get page's avatar
//               source.avatar = await page.$$eval('div[data-mcomponent="ServerImageArea"] > img', imgs => {
//                 return imgs[1].getAttribute('src');
//               });
//               source.type = 'FB_PAGE';
//             }
//           }
//         }
//         // END: Check source type and get source info
//         console.log('-----Done link: ', link)
//         if(source.id) {
//           validLinks.push(source);
//         } else {
//           invalidLinks.push(source);
//         }
//       }
//     } else {
//       invalidLinks = [...facebookLinks];
//     }
//     console.log('-----Done valid: ', validLinks)
//     console.log('-----Done invalid: ', invalidLinks)
//     return {
//       validLinks,
//       invalidLinks
//     };
//   } catch(err) {
//     console.log('err: ', err)
//     return {
//       validLinks: [],
//       invalidLinks: [...facebookLinks]
//     };
//   } finally {
//     page.browser().close();
//   }
// }

// const links = ['https://www.facebook.com/benbencogivui', 'https://www.facebook.com/334324282243542', 'https://www.facebook.com/groups/fmarketinvestors', 'https://www.facebook.com/benbencogivu', 'https://www.facebook.com/shenky1991'];
// checkFBSourcesType(links);
// await checkPostUrl('https://www.facebook.com/', { cookies: 'sb=JXdOYSxpuQuAH-pxeLz42OA_; datr=NXdOYbLimB4qOqLhpcKLzYNF; locale=vi_VN; vpd=v1%3B667x375x2; dpr=1; wd=1920x962; c_user=100025832514196; xs=35%3AWA1_LDt3jTdYmg%3A2%3A1656904259%3A-1%3A6295; fr=0U95fSkrOdYcvP8gB.AWVa1mt8f7fihP9BZG4VH4RPJNc.BiwFEI.Cf.AAA.0.0.BiwlpF.AWU3O5Qn5MY; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1656907664357%2C%22v%22%3A1%7D'});

// const groups = await getGroupsOfAccount('groupList', '100025832514196', { id: '100025832514196', cookies: 'sb=JXdOYSxpuQuAH-pxeLz42OA_; datr=NXdOYbLimB4qOqLhpcKLzYNF; vpd=v1%3B736x414x3; wd=1920x962; locale=vi_VN; c_user=100025832514196; xs=11%3A1mx-1U2HLa2cDQ%3A2%3A1657762710%3A-1%3A6295; fr=039uEVvYXLQyAnGsV.AWW_3IBfPvCfCAZ_HdthELeumes.Biz3OH.Cf.AAA.0.0.Biz3OY.AWWx6bhsdaI; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1657762721184%2C%22v%22%3A1%7D' });
// console.log('---------Length: ', groups.length)
// console.log('---------Groups: ', groups)