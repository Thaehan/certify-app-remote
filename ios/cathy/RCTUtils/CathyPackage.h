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

#import <UIKit/UIKit.h>
#import <objc/message.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTParserUtils.h>

/* Package to register custom native RN modules and views */

#pragma clang diagnostic ignored "-Wundeclared-selector"

#define RCT_EXTERN_VIEW_PROPERTY(name, type) \
    RCT_REMAP_VIEW_PROPERTY(name, __custom__, type) \
- (void)set_##name:(id)json forView:(id)view withDefaultView:(id)defaultView RCT_DYNAMIC { \
    const char *input = @#type.UTF8String; \
    SEL convert = NSSelectorFromString([RCTParseType(&input) stringByAppendingString:@":"]); \
    SEL setter = @selector(set_##name::); \
    if ([RCTConvert respondsToSelector:convert]) { \
        type val = ((type (*)(id, SEL, id))objc_msgSend)(RCTConvert.class, convert, json); \
        ((void (*)(id, SEL, type, id))objc_msgSend)(self, setter, val, view); \
    } else { \
        ((void (*)(id, SEL, id, id))objc_msgSend)(self, setter, json, view); \
    } \
}
