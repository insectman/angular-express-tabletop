import { IStringStringMap } from './helper.service';

export class Resource {
  private _fieldNames: string[];
  private fields: string[];
  private map: IStringStringMap;
  private _values: IStringStringMap;

  private fieldsAreSet: boolean;
  private fetchSuccess: boolean;
  private fetchError: string;
  protected defaultFields: IStringStringMap;

  get values() {
    if (!this._values) {
      this.setValuesAndFieldnames();
    }

    return this._values;
  }

  get fieldNames() {
    if (!this._fieldNames) {
      this.setValuesAndFieldnames();
    }

    return this._values;
  }

  private setValuesAndFieldnames() {

    this._values = {};
    if (!this.fieldsAreSet) {

      this.fieldsAreSet = !!this.fields;
      this._fieldNames = this.fields.concat(Object.keys(this.defaultFields));

      this._values = Object.assign(this.defaultFields, this.map);
      // this.values = map;
      return;
    }

    for (const param in this.map) {
      if (Object.prototype.hasOwnProperty.call(this.map, param)) {
        if (this._fieldNames.indexOf(param) !== -1) {
          this.values[param] = '' + this.map[param];
        }
      }
    }

    if (Object.keys(this.values).length !== this._fieldNames.length) {
      this.fetchSuccess = false;
      this.fetchError = 'some fields are missing from resource';
    } else {
      this.fetchSuccess = true;
    }

  }

  constructor(map: IStringStringMap, fields?: string[]) {
    this.fields = fields;
    this.map = map;
    this.defaultFields = {};
  }

}
