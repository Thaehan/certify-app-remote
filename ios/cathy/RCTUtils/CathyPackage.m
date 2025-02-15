/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */

#import "CathyPackage.h"
//#import "Cathy-Swift.h"

/* Package to register custom native RN modules and views */

@interface RCT_EXTERN_MODULE(AppVersion, NSObject)
@end

@interface RCT_EXTERN_MODULE(BuildVariant, NSObject)
@end

@interface RCT_EXTERN_MODULE(CryptoAES, NSObject)
RCT_EXTERN_METHOD(encrypt:(NSString *)mode :(NSString *)iv :(NSString *)key :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(decrypt:(NSString *)mode :(NSString *)iv :(NSString *)key :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
@end

@interface RCT_EXTERN_MODULE(CryptoDigest, NSObject)
RCT_EXTERN_METHOD(digest:(NSString *)algo :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
@end

@interface RCT_EXTERN_MODULE(CryptoRSA, NSObject)
RCT_EXTERN_METHOD(sign:(NSDictionary *)params :(NSString *)uuid :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(verify:(NSDictionary *)params :(NSString *)uuid :(NSString *)data :(NSString *)signature :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(encrypt:(NSDictionary *)params :(NSString *)uuid :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(decrypt:(NSDictionary *)params :(NSString *)uuid :(NSString *)data :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateKeyPair:(NSInteger)modulusSize :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(importKey:(NSString *)format :(NSString *)key :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(exportKey:(NSString *)format :(NSString *)uuid :(RCTPromiseResolveBlock)resolve :(RCTPromiseRejectBlock)reject)
@end

@interface RCT_EXTERN_MODULE(GridList, RCTViewManager)
RCT_EXTERN_VIEW_PROPERTY(itemCount, NSInteger)
RCT_EXTERN_VIEW_PROPERTY(rowHeight, CGFloat)
RCT_EXTERN_VIEW_PROPERTY(numColumns, NSInteger)
RCT_EXTERN_VIEW_PROPERTY(dragEnabled, BOOL)
RCT_EXTERN_VIEW_PROPERTY(verticalSpacing, CGFloat)
RCT_EXTERN_VIEW_PROPERTY(horizontalSpacing, CGFloat)
RCT_EXTERN_VIEW_PROPERTY(paddingInsets, NSDictionary *)
RCT_EXTERN_VIEW_PROPERTY(clipItem, BOOL)
RCT_EXTERN_METHOD(refreshDataSet:(NSNumber * _Nonnull)reactTag)
@end
