#!/usr/bin/env node

const fs = require('fs');

// // const paperMenuPath = './node_modules/react-native-paper/src/components/Menu/MenuItem.tsx';
// const paperMenuData = fs.readFileSync(paperMenuPath);
// const paperMenuFix = '    alignItems: \'center\',';
// if (!paperMenuData.includes(paperMenuFix)) {
//     let paperMenuString = paperMenuData.toString();
//     paperMenuString = paperMenuString.replace(/width: iconWidth,/g, 'width: iconWidth,\n' + paperMenuFix);
//     fs.writeFileSync(paperMenuPath, paperMenuString);
// }

// const paperPackagePath = './node_modules/react-native-paper/package.json';
// const paperPackageData = fs.readFileSync(paperPackagePath);
// // const paperPackageFix = '"react-native-safe-area-view": "^0.14.8"';
// if (!paperPackageData.includes(paperMenuFix)) {
//     let paperPackageString = paperPackageData.toString();
//     // paperPackageString = paperPackageString.replace('"react-native-safe-area-view": "^0.12.0"', paperPackageFix);
//     fs.writeFileSync(paperPackagePath, paperPackageString);
// }
