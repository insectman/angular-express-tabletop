import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { ResponseOptions } from '@angular/http';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      { id: 11, login: 'qwe', password: 'rty', username: 'sdgs'},
      { id: 12, login: 'dfg', password: 'sdf', username: 'xdh'},
      { id: 13, login: 'we', password: 'fg', username: 'dfj'},
      { id: 14, login: 'sdf', password: 'dfj', username: 'dfy'},
      { id: 15, login: 'xdfg', password: 'sdth', username: 'zseg'},
      { id: 16, login: 'xcvb', password: 'er', username: 'sth'},
      { id: 17, login: 'awd', password: 'szg', username: 'zseg'},
      { id: 18, login: 'weg', password: 'awf', username: 'SF'},
      { id: 19, login: 'awd', password: 'zsg', username: 'zseg'},
      { id: 20, login: 'awsdfsd', password: 'zsrthsg', username: 'zsseseg'},
      { id: 21, login: 'awhthd', password: 'zfwsg', username: 'z22seg'}
    ];

    const tables = [
      { id: 2, gameId: 1, tableName: 'efsefs', ownerId: 11, state: '1' },
      { id: 4, gameId: 2, tableName: 'srsr', ownerId: 13, state: '1' },
      { id: 7, gameId: 2, tableName: 'srgserg', ownerId: 12, state: '0' },
      { id: 9, gameId: 2, tableName: 'serhser', ownerId: 15, state: '0' },
      { id: 10, gameId: 1, tableName: 'eger', ownerId: 17, state: '2' },
      { id: 11, gameId: 1, tableName: 'dftdfth', ownerId: 16, state: '0' },
      { id: 13, gameId: 3, tableName: 'aefawefaw', ownerId: 18, state: '0' },
      { id: 14, gameId: 1, tableName: 'drthdthdr', ownerId: 19, state: '0' },
      { id: 16, gameId: 2, tableName: 'sddthfth', ownerId: 14, state: '0' },
    ];

    const games = [
      { id: 1, name: 'brs', minPlayers: 2, maxPlayers: 2 },
      { id: 2, name: 'mrs', minPlayers: 1, maxPlayers: 5 },
      { id: 3, name: 'mypkr', minPlayers: 2, maxPlayers: 8 },
      { id: 4, name: 'economy', minPlayers: 2, maxPlayers: 8 },
      { id: 5, name: 'mytcg', minPlayers: 2, maxPlayers: 2 },
    ];

    const userTables = [
      { id: 1, tableId: 2,  userId: 11, timestamp: 2341, isReady: '0'},
      { id: 2, tableId: 4,  userId: 13, timestamp: 125, isReady: '1'},
      { id: 3, tableId: 7,  userId: 12, timestamp: 1234, isReady: '0'},
      { id: 4, tableId: 9,  userId: 15, timestamp: 2341, isReady: '0'},
      { id: 5, tableId: 10, userId: 17, timestamp: 231, isReady: '0'},
      { id: 6, tableId: 11, userId: 16, timestamp: 4561, isReady: '0'},
      { id: 7, tableId: 13, userId: 18, timestamp: 5671, isReady: '0'},
      { id: 8, tableId: 4, userId: 19, timestamp: 13430, isReady: '0'},
      { id: 9, tableId: 16, userId: 14, timestamp: 9461, isReady: '0'},
      { id: 10, tableId: 2, userId: 20, timestamp: 934461, isReady: '1'},
      { id: 11, tableId: 2, userId: 21, timestamp: 769461, isReady: '0'},
    ];

    return { users, tables, games, userTables };
  }

  protected responseInterceptor(res: ResponseOptions, ri: RequestInfo): ResponseOptions {
    // console.log('responseInterceptor:');
    // console.log(ri);
    // res.body = this.myData;
    return res;
  }
}
