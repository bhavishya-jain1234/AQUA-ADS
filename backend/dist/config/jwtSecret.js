"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
/** Single source of truth — must match between sign (auth) and verify (middleware). */
exports.JWT_SECRET = process.env.JWT_SECRET || 'super_secret_for_mvp';
