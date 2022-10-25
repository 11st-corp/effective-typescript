# 아이템 25. 비동기 코드에는 콜백 대신 async 함수 사용하기

### Callback 

과거 자바스크립트에서는 비동기 동작을 모델링 하기위해 콜백을 사용했다.

```js
fetchURL(url1, function(response1) {
    fetchURL(url2, function(response2) {
        fetchURL(url3, function(response3) {
            //...
            console.log(1);
        })
        console.log(2);
    })
    console.log(3);
})
console.log(4);
```

### Promise (ES2015)

ES2015에서는 콜백 지옥을 극복하기 위해 프로미스 개념을 도입했다. 실행 순서도 코드 순서와 같다.

```js
const page1Promise = fetch(url1);
page1Promise.then(response1 => {
    return fetch(url2);
}).then(response2 => {
    return fetch(url3);
}).then(response3 => {
    // ...
}).catch(error => {
    // ...
})
```

### async / await (ES2017)

ES2017에서는 `async`와 `await` 키워드를 도입하여 더욱 간단하게 처리할 수 있게 되었다.

```js
async function fetchPages() {
    const response1 = await fetch(url1);
    const response2 = await fetch(url2);
    const response3 = await fetch(url3);
}
```

`await` 키워드는 `Promise`가 resolve(처리)될 때까지 fetchPages 함수의 실행을 멈춘다. reject(거절)되면 예외를 던지는데 이때 `try/catch` 구문을 사용해서 처리할 수 있다.

```js
async function fetchPages() {
    try {
        const response1 = await fetch(url1);
        const response2 = await fetch(url2);
        const response3 = await fetch(url3);
    } catch (e) {
        // ...
    }
}
```

### 콜백보다 프로미스를 사용해야하는 이유

- 콜백보다 프로미스가 코드를 작성하기 쉽다.
- 콜백보다 프로미스가 타입을 추론하기 쉽다.

#### 병렬 처리 - Promise.all

```js
async function fetchPages() {
    const [response1, response2, response3] = await Promise.all([
        fetch(url1), fetch(url2), fetch(url3)
    ]);
    // ... 
}
```

### Callback

```js
function fetchPagesCB() {
    let numDone = 0;
    const response: string[] = [];
    const done = () => {
        const [response1, response2, response3] = response;
        // ...
    };
    const urls = [url1, url2, url3];
    urls.forEach((url, i) => {
        fetchURL(url, r => {
            response[i] = url;
            numDone++;
            if (numDone === urls.length) done();
        })
    })
}
```

이 코드에 오류 처리를 포함하거나 `Promise.all` 같은 일반적인 코드로 확장하는것은 쉽지 않다.

### 프로미스를 직접 사용하기보다는 `async` / `await` 를 활용해야하는 이유

- 일반적으로 더 간결하고 직관적인 코드를 작성할 수 있다.
- `async` 함수는 항상 프로미스를 반환하도록 강제된다.
- `async` 함수에서 프로미스를 반환하면 또 다른 프로미스로 래핑되지 않는다.

```typescript
const getNumber = async () => 42; // 타입이 () => Promise<number>

const getNumber = () => Promise.reslove(42); // 타입이 () => Promise<number>
```

### 요약

- 콜백보다는 프로미스를 사용하는게 코드 작성과 타입 추론 면에서 유리하다.
- 가능하면 프로미스보다는 `async` / `await`를 사용하자. 간결하고 직관적인 코드를 작성할 수 있고 모든 종류의 오류를 제거할 수있다.
- 어떤 함수가 프로미스를 반환한다면 `async`로 선언하는것이 좋다. 