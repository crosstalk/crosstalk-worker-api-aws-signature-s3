/*
 * index.js
 *
 * (C) 2012 Crosstalk Systems Inc.
 */
"use strict";

var crypto = require( 'crypto' ),
    dateformat = require( 'dateformat' ),
    logger = require( 'logger' );

var DEFAULT_HTTP_VERB = "GET";

//
// * not supported:
//   - multiple headers with the same name
//   - long, multi-line spanning headers
//
var createCanonicalAmzHeaders = function createCanonicalAmzHeaders ( headers ) {

  var canonicalAmzHeaders = [];

  Object.keys( headers ).forEach( function ( header ) {

    // drop non x-amz- headers
    if ( header.indexOf( "x-amz-" ) !== 0 ) return;

    canonicalAmzHeaders.push( header + ":" + headers[ header ].trim() + "\n" );

  }); // Object.keys( headers ).forEach

  canonicalAmzHeaders.sort();

  return canonicalAmzHeaders.join( '' );

}; // createCanonicalAmzHeaders

//
// not supporting sub-resources at this time
//
var createCanonicalResource = function createCanonicalResource ( bucketName,
   objectName, subResources ) {

  subResources = subResources || [];

  return "/" + bucketName + "/" + objectName + 
     ( ( subResources.length > 0 ) ? "?" + subResources.join( '&' ) : '' );

}; // createCanonicalResource

var createStringToSign = function createStringToSign ( httpVerb, contentMD5,
   contentType, date, canonicalAmzHeaders, canonicalResource ) {

  return httpVerb.toUpperCase() + "\n"
     + contentMD5 + "\n"
     + contentType + "\n"
     + date + "\n"
     + canonicalAmzHeaders
     + canonicalResource;

}; // createStringToSign

var hmac = function hmac ( key, stringToSign, format ) {

  return crypto.createHmac( 'sha256', key ).update( stringToSign )
     .digest( format );

}; // hmac

var s3 = function s3 ( params, callback ) {

  if ( ! callback ) return; // nothing to do

  //
  // required params
  //
  var awsAccessKeyId = params.awsAccessKeyId,
      bucketName = params.bucketName,
      objectName = params.objectName,
      secretAccessKey = params.secretAccessKey;

  if ( ! awsAccessKeyId ) return callback( { message : "missing awsAccessKeyId" } );
  if ( ! bucketName ) return callback( { message : "missing bucketName" } );
  if ( typeof( objectName ) === 'undefined' ) {
    return callback( { message : "missing objectName" } );
  }
  if ( ! secretAccessKey ) return callback( { message : "missing secretAccessKey" } );

  //
  // optional params
  //
  var headers = params.headers || {},
      httpVerb = params.httpVerb || DEFAULT_HTTP_VERB,
      subResources = params.subResources;

  var lowercaseHeaders = {};

  Object.keys( headers ).forEach( function ( header ) {
    lowercaseHeaders[ header.toLowerCase() ] = headers[ header ];
  });

  // 
  // optional params that could also be headers
  //
  var contentMD5 = params.contentMD5 || lowercaseHeaders[ 'content-md5' ] || "",
      contentType = params.contentType || lowercaseHeaders[ 'content-type' ] 
         || "",
      date = params.date || lowercaseHeaders[ 'date' ] 
         || dateformat( new Date(), "UTC:ddd, dd mmm yyyy HH:MM:ss +0000" );

  var canonicalResource = createCanonicalResource( bucketName, objectName,
     subResources );

  logger.debug( "canonicalResource: " + canonicalResource );

  var canonicalAmzHeaders = createCanonicalAmzHeaders( lowercaseHeaders );

  logger.debug( "canonicalAmzHeaders: " + canonicalAmzHeaders );

  var stringToSign = createStringToSign( httpVerb, contentMD5, contentType,
     date, canonicalAmzHeaders, canonicalResource );

  logger.debug( "stringToSign: " + stringToSign );

  var signature = hmac( secretAccessKey, stringToSign, 'base64' );

  var authorizationHeader = "AWS " + awsAccessKeyId + ":" + signature;

  return callback( null, {
    authorization : authorizationHeader,
    date : date,
    signature : signature
  })

}; // s3

crosstalk.on( 'api.aws.signature.s3', 'public', s3 );