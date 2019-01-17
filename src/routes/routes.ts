/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../ioc';
import { UsersController } from './../controllers/users';
import * as express from 'express';

const models: TsoaRoute.Models = {
  "User": {
    "properties": {
      "id": { "dataType": "double", "required": true },
      "email": { "dataType": "string", "required": true },
      "firstName": { "dataType": "string", "required": true },
      "lastName": { "dataType": "string", "required": true },
    },
  },
  "UserCreationRequest": {
    "properties": {
      "firstName": { "dataType": "string", "required": true },
      "lastName": { "dataType": "string", "required": true },
      "email": { "dataType": "string", "required": true },
    },
  },
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
  app.get('/v1/Users/:id',
    function(request: any, response: any, next: any) {
      const args = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "double" },
        name: { "in": "query", "name": "name", "required": true, "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = iocContainer.get<UsersController>(UsersController);
      if (typeof controller['setStatus'] === 'function') {
        (<any>controller).setStatus(undefined);
      }


      const promise = controller.getUser.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });
  app.post('/v1/Users',
    function(request: any, response: any, next: any) {
      const args = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UserCreationRequest" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = iocContainer.get<UsersController>(UsersController);
      if (typeof controller['setStatus'] === 'function') {
        (<any>controller).setStatus(undefined);
      }


      const promise = controller.createUser.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });


  function isController(object: any): object is Controller {
    return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
  }

  function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
    return Promise.resolve(promise)
      .then((data: any) => {
        let statusCode;
        if (isController(controllerObj)) {
          const headers = controllerObj.getHeaders();
          Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
          });

          statusCode = controllerObj.getStatus();
        }

        if (data || data === false) { // === false allows boolean result
          response.status(statusCode || 200).json(data);
        } else {
          response.status(statusCode || 204).end();
        }
      })
      .catch((error: any) => next(error));
  }

  function getValidatedArgs(args: any, request: any): any[] {
    const fieldErrors: FieldErrors = {};
    const values = Object.keys(args).map((key) => {
      const name = args[key].name;
      switch (args[key].in) {
        case 'request':
          return request;
        case 'query':
          return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors);
        case 'path':
          return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors);
        case 'header':
          return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors);
        case 'body':
          return validationService.ValidateParam(args[key], request.body, name, fieldErrors, name + '.');
        case 'body-prop':
          return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.');
      }
    });
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, '');
    }
    return values;
  }
}
