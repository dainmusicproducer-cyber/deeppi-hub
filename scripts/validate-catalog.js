#!/usr/bin/env node

/**
 * Validate catalog.json against schema
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemaPath = path.join(__dirname, '..', 'packages', 'catalog-schema', 'schema.json');
const catalogPath = path.join(__dirname, '..', 'catalog.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

const validate = ajv.compile(schema);
const valid = validate(catalog);

if (valid) {
  console.log('✅ Catalog is valid');
  process.exit(0);
} else {
  console.error('❌ Catalog validation failed:');
  console.error(validate.errors);
  process.exit(1);
}
