import { Observable } from 'rx-lite';

export default function (input) {
  input.intentPath = '/hello';
  return Observable.return(input);
}