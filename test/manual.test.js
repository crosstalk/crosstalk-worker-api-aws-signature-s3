/*
 * manual.test.js
 *
 * (C) 2012 Crosstalk Systems Inc.
 */
"use strict";

var ide = require( 'crosstalk-ide' )(),
    workerPath = require.resolve( '../index' );

var worker;

worker = ide.run( workerPath );

var exampleGet = {
  awsAccessKeyId : "AKIAIOSFODNN7EXAMPLE",
  bucketName : "johnsmith",
  headers : {
    Date : "Tue, 27 Mar 2007 19:36:42 +0000"
  },
  httpVerb : "GET",
  objectName : "photos/puppy.jpg",
  secretAccessKey : "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
};

worker.send( 'api.aws.signature.s3', exampleGet, 'public', true );

var examplePut = {
  awsAccessKeyId : "AKIAIOSFODNN7EXAMPLE",
  bucketName : "johnsmith",
  contentLength : 94328,
  contentType : 'image/jpeg',
  headers : {
    Date : "Tue, 27 Mar 2007 21:15:45 +0000"
  },
  httpVerb : "PUT",
  objectName : "photos/puppy.jpg",
  secretAccessKey : "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
};

worker.send( 'api.aws.signature.s3', examplePut, 'public', true );

var exampleGetWithAcl = {
  awsAccessKeyId : "AKIAIOSFODNN7EXAMPLE",
  bucketName : "johnsmith",
  headers : {
    Date : "Tue, 27 Mar 2007 19:44:46 +0000"
  },
  objectName : "",
  secretAccessKey : "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  subResources : [ 'acl' ]
};

worker.send( 'api.aws.signature.s3', exampleGetWithAcl, 'public', true );

var exampleWithMeta = {
  awsAccessKeyId : "AKIAIOSFODNN7EXAMPLE",
  bucketName : "johnsmith",
  headers : {
    "x-amz-acl": "public-read",
    "Content-MD5": "4gJE4saaMU4BqNR0kLY+lw==",
    "Content-Type": "application/x-download",
    "Content-Encoding": "gzip",
    Date : "Tue, 27 Mar 2007 21:06:08 +0000",
    "X-Amz-Meta-ReviewedBy": "joe@johnsmith.net,jane@johnsmith.net",
    "X-Amz-Meta-FileChecksum": "0x02661779",
    "X-Amz-Meta-ChecksumAlgorithm": "crc32"
  },
  httpVerb : "PUT",
  objectName : "db-backup.dat.gz",
  secretAccessKey : "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
};

worker.send( 'api.aws.signature.s3', exampleWithMeta, 'public', true );