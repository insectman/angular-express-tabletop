import { Resource } from './resource';
import { IStringStringMap } from './helper.service';

import { User } from './user';
import { Table } from './table';

export class UserTable extends Resource {

  public user: User;
  public table: Table;

  constructor(map: IStringStringMap) {

    super(map, [
      'id',
      'userId',
      'tableId',
      'timestamp'
    ]);

    this.defaultFields = {
      isReady: '0'
    };

  }

}
