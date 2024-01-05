import * as CategoryRepo from "../repositories/Category.repo.js";
import * as messages from "../config/messages.js";
import { Response, PagedResponse } from '../util/Response.js'

export const getAllCategories = async (req, res, next) => {
    try {
        const rs = await CategoryRepo.findAll();
        res.json(new Response({
            code: 200,
            doc: rs
        }),
        );
    } catch (error) {
        //req.log.error(messages.ERROR_GET_CATEGORIES);
        next(error);
    }
}

export const getCategoryById = async (req, res, next) => {
    try {
        const profile = await CategoryRepo.findById(req.params.id);
        res.json(
            new Response({
                code: 200,
                doc: profile
            }),
        );
    } catch (err) {
        //req.log.error(messages.ERROR_GET_CATEGORIES);
        next(err);
    }
};

export const addCategory = async (req, res, next) => {
    try {
        //req.body.name = 'hung';
        const profile = await CategoryRepo.add(req.body);
        if (profile) {
            res.json(
                new Response({
                    code: 200,
                    doc: profile,
                }),
            );
        } else {
            res.json(
                new Response({
                    code: 500,
                    message: messages.ERROR_GET_CATEGORIES,
                }),
            );
        }
    } catch (err) {
        //req.log.error(messages.ERROR_GET_CATEGORIES);
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const profile = await CategoryRepo.update(req.params.id, req.body);

        if (!profile) {
            res.json(
                new Response({
                    code: 404,
                    message: messages.ERROR_GET_CATEGORIES,
                }),
            );
        } else {
            res.json(
                new Response({
                    code: 200,
                    doc: profile,
                })
            );
        }
    } catch (err) {
        req.log.error(messages.ERROR_GET_CATEGORIES);
        next(err);
    }
};

export const deletCategory = async (req, res, next) => {
    try {
        const account = await CategoryRepo.remove(req.params.id);
        if (account) {
            res.json(
                new Response({
                    code: 200,
                    doc: account
                })
            );
        } else {
            res.json(
                new Response({
                    code: 404,
                    message: messages.ERROR_GET_CATEGORIES
                })
            );
        }
    } catch (err) {
        req.log.error(messages.ERROR_GET_CATEGORIES);
        next(err);
    }
};