# 추론 가능한 타입을 사용해 장황한 코드 방지하기

> TS의 많은 타입 구문은 사실 불필요합니다. 모든 변수에 타입을 선언하는 것은 비생산적이며 형편없는 스타일로 여겨집니다. 

타입선언이 불필요한 상황에 대해 먼저 알아보자.

<br/>

#### 1. 객체에 대한 타입 구문은 필요하지 않다.
> 타입시스템은 선언된 객체의 값을 통해서 타입을 추론한다. 실제로 아래 두개의 객체의 타입은 동일하다.
```typescript
const doNotPerson : {
    name: string,
    born: { where: string, when: string },
    died: { where: string, when: string }
} = {
    name: 'Sojour Thruth',
    born: {
        where: 'south korea',
        when: 'c.1797',
    },
    died: {
        where: 'Battle Vreek, MI',
        when: 'Nov. 26, 1883'
    }
}


const person =  {
    name: 'Sojour Thruth',
    born: {
        where: 'south korea',
        when: 'c.1797',
    },
    died: {
        where: 'Battle Vreek, MI',
        when: 'Nov. 26, 1883'
    }
}
```


<br/>


#### 2. 타입 추론이 가능한 비구조화 할당에는 타입 구문이 필요하지 않다.
> 비구조화 할당시에 속성 타입이 추론이 가능하기 때문에 타입구문이 불필요하다.
```typescript
interface Product {
    id: number;
    name: string;
    price: number;
}

function logProduct(product : Product) {
    const localId = product.id; // number
    const { id }: { id: number } = product; // number
}
```
- 사실 지역변수로 선언하여도 타입추론이 가능하다.

> 함수 내에서 생성된 지역 변수에는 타입 구문을 넣지 않습니다. **타입 구문을 생략하여 방해되는 것들을 최소화하고 코드를 읽는 사람이 구현 로직에 집중할 수 있게 하는 것이 좋습니다.**

<br/>

#### 3. 기본값이 존재하는 함수의 파라미터에 대해서는 타입 구문이 필요하지 않다.

```typescript
function parseNumber(str: string, base=10) {
    base.toExponential(10);
}
```
- base가 number 타입이기 때문에 `toExponential()` 메서드를 사용할 수 있다.

<br/>

> 타입정보가 있는 라이브러리의 콜백 함수의 파라미터 타입은 자동으로 추론된다.
```typescript
app.get('health', (request: express.Request, response: express.Response)=> {
    response.send('ok')
})

app.get('health', (request, response)=> {
    response.send('ok')
})
```

<br/>

### 타입 구문이 필요한 경우


#### 4. 객체의 속성체크가 필요한 경우 타입 구문으로 객체의 타입을 선언한다.
```typescript
interface Product {
    id: number;
    name: string;
    price: number;
}

function logProduct(product : Product) {
    const localId = product.id; // number
    const { id }: { id: number } = product; // number
}

const elmo = {
    id: '048188 627',
    name: 'Tickle Me Elmo',
    price: 28.99,
}

logProduct(elmo); // Types of property 'id' are incompatible. Type 'string' is not assignable to type 'number'.
```
- `elmo` 객체를 `logProduct`의 인자로 사용하고자 하나, `Product`의 `id`의 타입과 다르기 때문에 오류가 발생한다.
- 객체에 대한 타입 선언을 하지 않았기 때문에 객체를 사용하는 시점에 오류가 발생한다.

```typescript
const elmo: Product = {
    id: '048188 627', // Type 'string' is not assignable to type 'number'.
    name: 'Tickle Me Elmo',
    price: 28.99,
}
```
- 변수를 사용하는 시점이 아닌 할당하는 시점에 오류를 발생한다.


<br/>

#### 5. 함수 반환값은 타입 구문을 통해 타입을 선언한다.
```typescript
const cache: {[ticker:string]: number} = {};
function getQuote(ticker: string) {
    if(ticker in cache) {
        return cache[ticker]; //number
    }
    return new Promise<number>((resolve, reject)=> {
        resolve(1);
    }).then(response => {
        cache[ticker] = response;
        return response; // Promise<number>
    })
}

getQuote('wow').then() //Property 'then' does not exist on type 'number | Promise<number>'. Property 'then' does not exist on type 'number'.
```
- 반환값에 대한 타입 선언을 하지 않으면, 분기에 따라 반환값의 형식이 달라질 경우 사용 시점에 오류가 발생한다.
- 반환값에 대한 타입 선언을 통해서 분기에 따라 반환값이 달라질 수 있다는 것을 선언 시점에 확인할 수 있다.

<br/>

```typescript
interface Vector2D { x: number; y: number;}
function add(a: Vector2D, b: Vector2D) {
    return { x: a.x + b.x, y: a.y + b.y };
}
// function add(a: Vector2D, b: Vector2D): {x: number, y: number}

function add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
}
// function add(a: Vector2D, b: Vector2D): Vector2D
```
- 함수 반환 값에 대한 타입 선언을 명명된 타입을 사용하여 해당 함수를 조금 더 직관적으로 이해할 수 있다.



<br/>

### 정리하자면,

#### 1. 맹목적인 타입 추가보다는 타입시스템이 충분히 추론 가능한 타입에 대해서는 타입 구문을 피하자. 

#### 2. 함수 내의 지역 변수에는 타입구문을 줄여 로직에 대한 가독성을 높이자.

#### 3. 속성체크를 위한 객체 선언과 함수 반환값에 대해서는 타입 선언을 하자. 
