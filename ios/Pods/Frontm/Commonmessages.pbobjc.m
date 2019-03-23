// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: commonmessages.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers_RuntimeSupport.h>
#else
 #import "GPBProtocolBuffers_RuntimeSupport.h"
#endif

#import "Commonmessages.pbobjc.h"
// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

#pragma mark - CommonmessagesRoot

@implementation CommonmessagesRoot

// No extensions in the file and no imports, so no need to generate
// +extensionRegistry.

@end

#pragma mark - CommonmessagesRoot_FileDescriptor

static GPBFileDescriptor *CommonmessagesRoot_FileDescriptor(void) {
  // This is called by +initialize so there is no need to worry
  // about thread safety of the singleton.
  static GPBFileDescriptor *descriptor = NULL;
  if (!descriptor) {
    GPB_DEBUG_CHECK_RUNTIME_VERSIONS();
    descriptor = [[GPBFileDescriptor alloc] initWithPackage:@"commonmessages"
                                                     syntax:GPBFileSyntaxProto3];
  }
  return descriptor;
}

#pragma mark - Empty

@implementation Empty


typedef struct Empty__storage_ {
  uint32_t _has_storage_[1];
} Empty__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[Empty class]
                                     rootClass:[CommonmessagesRoot class]
                                          file:CommonmessagesRoot_FileDescriptor()
                                        fields:NULL
                                    fieldCount:0
                                   storageSize:sizeof(Empty__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - PhoneNumbers

@implementation PhoneNumbers

@dynamic satellite;
@dynamic land;
@dynamic mobile;

typedef struct PhoneNumbers__storage_ {
  uint32_t _has_storage_[1];
  NSString *satellite;
  NSString *land;
  NSString *mobile;
} PhoneNumbers__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "satellite",
        .dataTypeSpecific.className = NULL,
        .number = PhoneNumbers_FieldNumber_Satellite,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(PhoneNumbers__storage_, satellite),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "land",
        .dataTypeSpecific.className = NULL,
        .number = PhoneNumbers_FieldNumber_Land,
        .hasIndex = 1,
        .offset = (uint32_t)offsetof(PhoneNumbers__storage_, land),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "mobile",
        .dataTypeSpecific.className = NULL,
        .number = PhoneNumbers_FieldNumber_Mobile,
        .hasIndex = 2,
        .offset = (uint32_t)offsetof(PhoneNumbers__storage_, mobile),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[PhoneNumbers class]
                                     rootClass:[CommonmessagesRoot class]
                                          file:CommonmessagesRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(PhoneNumbers__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end

#pragma mark - DomainRoles

@implementation DomainRoles

@dynamic domain;
@dynamic rolesArray, rolesArray_Count;

typedef struct DomainRoles__storage_ {
  uint32_t _has_storage_[1];
  NSString *domain;
  NSMutableArray *rolesArray;
} DomainRoles__storage_;

// This method is threadsafe because it is initially called
// in +initialize for each subclass.
+ (GPBDescriptor *)descriptor {
  static GPBDescriptor *descriptor = nil;
  if (!descriptor) {
    static GPBMessageFieldDescription fields[] = {
      {
        .name = "domain",
        .dataTypeSpecific.className = NULL,
        .number = DomainRoles_FieldNumber_Domain,
        .hasIndex = 0,
        .offset = (uint32_t)offsetof(DomainRoles__storage_, domain),
        .flags = GPBFieldOptional,
        .dataType = GPBDataTypeString,
      },
      {
        .name = "rolesArray",
        .dataTypeSpecific.className = NULL,
        .number = DomainRoles_FieldNumber_RolesArray,
        .hasIndex = GPBNoHasBit,
        .offset = (uint32_t)offsetof(DomainRoles__storage_, rolesArray),
        .flags = GPBFieldRepeated,
        .dataType = GPBDataTypeString,
      },
    };
    GPBDescriptor *localDescriptor =
        [GPBDescriptor allocDescriptorForClass:[DomainRoles class]
                                     rootClass:[CommonmessagesRoot class]
                                          file:CommonmessagesRoot_FileDescriptor()
                                        fields:fields
                                    fieldCount:(uint32_t)(sizeof(fields) / sizeof(GPBMessageFieldDescription))
                                   storageSize:sizeof(DomainRoles__storage_)
                                         flags:GPBDescriptorInitializationFlag_None];
    NSAssert(descriptor == nil, @"Startup recursed!");
    descriptor = localDescriptor;
  }
  return descriptor;
}

@end


#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)