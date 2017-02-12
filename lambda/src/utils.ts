// Turns a callback style function that takes a single argument into a Promise
export function promisify<T>(toPromise: (input: T, callback: (err: any, result: any) => void) => void, input: T): Promise<any> {
  return new Promise((resolve, reject) => {
    toPromise(input, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}
