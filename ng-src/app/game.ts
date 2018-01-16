import { Resource } from './resource';
import { IStringStringMap } from './helper.service';

export class Game extends Resource {

  constructor(map: IStringStringMap) {

    super(map, [
      'id',
      'name',
      'minPlayers',
      'maxPlayers'
    ]);
  }

}
