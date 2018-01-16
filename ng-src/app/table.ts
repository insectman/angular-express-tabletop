import { Resource } from './resource';
import { User } from './user';
import { IStringStringMap } from './helper.service';

export class Table extends Resource {

  public users: User[];
  public isCurrentTable: boolean;
  public isOwnedByMe: boolean;
  public ownerName: string;
  public gameName: string;

  private stateLabels = [
    'created',
    'starting',
    'playing',
    'finished',
    'abandoned'
  ];

  constructor(map: IStringStringMap) {

    super(map, [
      'id',
      'gameId',
      'tableName',
      'ownerId',
    ]);

    this.defaultFields = {
      state: '0'
    };

    this.users = [];
    this.isCurrentTable = false;
    this.ownerName = '';
    this.gameName = '';
    this.isOwnedByMe = false;
  }

  get stateText() {
    return this.stateLabels[this.values.state];
  }

}
