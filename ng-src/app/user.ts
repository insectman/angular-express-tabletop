import { Resource } from './resource';
import { IStringStringMap } from './helper.service';

export class User extends Resource {

  constructor(map: IStringStringMap) {

    super(map, [
      'id',
      'login',
      'password',
      'username'
    ]);
  }

}
