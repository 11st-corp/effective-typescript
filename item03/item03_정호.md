# 코드 생성과 타입이 관계없음을 이해하기

타입스크립트의 컴파일러는 크게 두 가지 역할을 수행한다.

- 최신 TS/JS를 브라우저에서 동작할 수 있도록 구버전의 JS로 트랜스파일링
- 코드의 타입 오류를 체크

> transpile(트랜스파일) : translate(번역) + compile이 합쳐진 신조어
고수준 언어(high-level language)인 TS를 또 다른 고수준 언어인 JS로 변환하기 때문에 컴파일과는 구분해서 부름

이 두 가지 역할은 “독립적”이라는 점이 중요하다. 

다시 말해,

- TS가 JS로 변환될 때 코드 내의 타입에는 영향을 주지 않는다.
- JS의 실행 시점에도 타입은 영향을 미치지 않는다.

이를 기반으로 TS가 **할 수 있는 일**과, **할 수 없는 일**을 정의하여 몇 가지 특성을 알아보자

<br/>

## 1. 타입 오류가 있는 코드도 컴파일이 가능하다

앞서 말한 두 가지 역할(트랜스파일, 타입 체크)은 독립적으로 동작하기 때문에, TS는 코드 내 타입오류가 있어도 컴파일이 가능하다.

```bash
$ cat test.ts
let x = 'hello';
x = 1234;

$ tsc test.ts
test.ts:2:1 - error TS2322: Type 'number' is not assignable to type 'string'.

2 x = 1234;
  ~

Found 1 error in test.ts:2

$ cat test.js
var x = 'hello';
x = 1234;
```

> 빌드 시 타입에러를 표시해주지만 빌드가 멈추는 것은 아니다.
작성한 TS가 유효한 문법의 JS라면, 컴파일을 수행한다.
> 

이는 다른 컴파일 언어(C, Java, …)들과 비교되는 특성으로, 이는 애플리케이션의 한 부분에서 에러가 났더라도 다른 부분을 테스트할 수 있다는 점에서 이점이 될 수 있다.

> cf) 만약 오류가 있을 때 컴파일 하지 않으려면, `tsconfig.json`에 `noEmitOnError`를 설정하면 된다.

<br/>

## 2. 런타임에는 타입 체크가 불가능하다

타입에 따라 분기처리를 해야하는 경우가 있다고 가정해보자.

만약 아래와 같이 작성한다면, 주석에 보이는 타입 에러를 맞닥뜨리게 된다.

```tsx
interface Square {
  width: number;
}
interface Rectangle extends Square {
  height: number;
}
type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) { // error TS2693: 'Rectangle' only refers to a type, but is being used as a value here.
    return shape.width * shape.height;  // error TS2339: Property 'height' does not exist on type 'Shape'.
  }
  return shape.width * shape.width;
}
```

TS를 컴파일하면 JS로 변환되기 때문에, 컴파일 시의 TS의 타입, 타입구문, 인터페이스는 모두 **제거**되어 버린다.

따라서 위 코드에서 `instanceof` 체크는 런타임에 일어나지만, `Rectangle`은 타입이기 때문에 런타임에 아무 역할도 할 수 없다.

실제 컴파일 결과를 보면, 왜 그런지 납득 가능하다.

```jsx
function calculateArea(shape) {
    if (shape instanceof Rectangle) { // Rectangle에 대한 타입 정보를 알 수 없다
        return shape.width * shape.height;
    }
    return shape.width * shape.width;
}
```

위 TS코드에서 shape 타입을 명확히 하려면, 런타임에 타입 정보를 유지해야 한다.

이를 위한 방법은 세 가지가 있다.

1. 속성 체크
    
    ```tsx
    function calculateArea(shape: Shape) {
      if ('height' in shape) {
        return shape.width * shape.height; // 타입이 Rectangle
      }
      return shape.width * shape.width;
    }
    ```
    
    > 타입 정보를 이용하는 것은 아니지만, 런타임에 접근 가능한 값으로 체크하여 해결 가능하다.
    또한, 타입 체커도 shape의 타입을 Rectangle로 보정해주기 때문에 에러가 사라진다.
    > 
2. 태그 기법
    
    ```tsx
    interface Square {
      kind: 'square';
      width: number;
    }
    interface Rectangle {
      kind: 'rectangle';
      height: number;
      width: number;
    }
    type Shape = Square | Rectangle;
    
    function calculateArea(shape: Shape) {
      if (shape.kind === 'rectangle') {
        return shape.width * shape.height; // 타입이 Rectangle
      }
      return shape.width * shape.width;
    }
    ```
    
    > 타입 정보를 객체의 속성으로 명시적으로 지정하여 해결
    > 
    
    여기서 `Shape`의 타입은 ‘태그된 유니온(tagged union)의 한 예이다. 이는 런타임에 타입 정보를 유지하기 위한 쉬운 방법으로 흔하게 볼 수 있는 방식이다.
    
    > 위의 `kind` 속성처럼, 특정 속성을 통해 값이 속하는 브랜치를 식별할 수 있다는 이유로 **식별 가능한 유니온**(discriminated union type) 또는 **태그된 유니온**
    (tagged union)이라는 이름을 갖는다. 브랜치를 식별하기 위해 쓰이는 `kind` 속성은 식별자(discriminator) 또는 태그(tag)라 불린다.
    
    출처: [https://ahnheejong.gitbook.io/ts-for-jsdev/06-type-system-deepdive/disjoint-union-type](https://ahnheejong.gitbook.io/ts-for-jsdev/06-type-system-deepdive/disjoint-union-type)
    > 
    
3. Class 사용
    
    ```tsx
    class Square {
      constructor(public width: number) {}
    }
    class Rectangle extends Square {
      constructor(public width: number, public height: number) {
        super(width);
      }
    }
    type Shape = Square | Rectangle;
    
    function calculateArea(shape: Shape) {
      if (shape instanceof Rectangle) {
        return shape.width * shape.height;
      }
      return shape.width * shape.width;
    }
    ```
    
    > Class를 사용하면 타입(런타임 접근 불가)과 값(런타임 접근 가능)을 둘 다 사용하기 때문에, 오류를 해결할 수 있다.
    > 
    
    `type Shape = Square | Rectangle;` 에서 Rectangle과 Square는 타입으로 참조되지만, 
    
    `shape instanceof Rectangle` 에서는 값으로 참조된다.
    
    (참조되는 방식을 구분하는 법은 아이템8에서 다룸)
    
<br/>

## 3.  타입 연산은 런타임에 영향을 주지 않는다

string 또는 number타입의 인수가 들어오면, number로 정제하는 함수가 있다고 가정하자.

```tsx
// ts
function asNumber(val: number | string): number {
  return val as number;
}
// compiled js
function asNumber(val) {
  return val;
}
```

> 위 ts코드는 타입체커를 통과하지만, 컴파일된 결과를 보면 아무런 정제 과정이 없어 잘못된 코드임을 볼 수 있다.
> 

`as number`는 타입 연산이기 때문에 컴파일시 지워지게 되며, 런타임 동작에 영향을 줄 수 없다.

따라서, 올바른 동작을 위해선 런타임의 타입을 체크하고 자바스크립트 연산을 통해 변환을 수행해야 한다.

```tsx
function asNumber(val: number | string): number {
  return typeof val === 'string' ? Number(val) : val;
}
```

<br/>

## 4. 런타임 타입은 선언된 타입과 다를 수 있다

```tsx
function setLigthSwitch(value: boolean) {
  switch(value) {
    case true:
      turnLightOn();
      break;
    case false:
      turnLightOff();
      break;
    default:
      console.log('실행되지 않을까 봐 걱정됩니다.')
  }
}
```

위 함수에서 console.log가 출력되는 경우가 있을까?

Editor를 통해 스크립트를 작성하다 보면 TS는 실행되지 못하는 죽은(dead) 코드를 찾아내지만, 여기서는 strict옵션을 줘도 찾아내지 못한다.

여기서 console.log를 출력할 수 있는 경우는 무엇일까?

<br/>

`: boolean`이 타입 선언문이라는 점이 함정이다.

이는 런타임에 제거되는 부분으로 JS에서 `setLigthSwitch(’ON’)`과 같이 호출할 수도 있게 된다.

순수 타입스크립트에서도 console.log가 출력되게 할 수도 있다.

예를 들어, 아래 예시와 같이 서버에서 네트워크 호출로 받은 값을 함수의 인수로 사용한다면, 런타임에 호출된 api에서 boolean이 아닌 string의 값이 내려오는 경우도 있을 수 있다.

```tsx
interface LightApiResponse {
  lightSwitchValue: boolean;
}
async function setLight() {
  const response = await fetch('/light');
  const result: LightApiResponse = await response.json();
  setLigthSwitch(result.lightSwitchValue);
}
```

> TS에서는 런타임 타입과 선언된 타입이 맞지 않을 수 있다. 선언된 타입이 언제든지 달라질 수 있다는 것을 주의하며 스크립트를 작성해야 한다.
> 

<br/>

## 5. 타입스크립트 타입으로는 함수를 오버로드할 수 없다

C++ 같은 언어는 동일한 이름에 매개변수만 다른 함수를 선언(함수 오버로딩)할 수 있다.

하지만, TS는 타입과 런타임 동작이 무관하기 때문에, 함수 오버로딩을 할 수 없다.

```tsx
function add(a: number, b: number) { return a + b; }  // error TS2393: Duplicate function implementation.
function add(a: string, b: string) { return a + b; }  // error TS2393: Duplicate function implementation.
```

> 컴파일시 타입이 제거된다 생각하면, 구분되지 않는 동일한 함수가 선언될 것을 예상할 수 있다.
> 

타입스크립트에서 함수 오버로딩 기능을 지원하기는 한다.

다만, 타입수준에서만 동작하며, 한 함수에 대해 여러 선언문을 작성할 수 있을 뿐이며, 구현체(implementation)은 오직 하나 뿐이다.

```tsx
function add(a: number, b: number): number;
function add(a: string, b: string): string;

function add(a, b) {
  return a + b;
}

const three = add(1, 2);
const twelve = add('1', '2');
```

> 컴파일 시 타입에러도 없고, 정상적으로 컴파일 되지만 `Duplicate function implementation.ts(2393)` 에디터내 에러로 표시되긴 함. 
> vscode내 기본 tsconfig값 때문인 것으로 추측

<br/>

## 6. 타입스크립트 타입은 런타임 성능에 영향을 주지 않는다

타입과 타입 연산자는 JS로 트랜스파일 시점에 제거되기 때문에 성능에 아무런 영향을 주지 않는다.

다시말해, ‘런타임’ 오버헤드가 없다.

다만, TS파일을 JS로 컴파일하는 시간이 추가되었기 때문에 ‘빌드타임’ 오버헤드가 존재한다.

오버헤드가 커지면 빌드 도구에서 ‘transpile only’를 설정하여 타입 체크를 건너뛸 수 있다.

<br/>

## 정리

1. 코드 생성과 타입 시스템은 독립적이며 무관하다. 타입스크립트의 타입은 런타임 동작이나 성능에 영향을 주지 않는다.
2. 타입 오류가 존재해도 코드 생성(컴파일)은 가능하다.
3. 런타임 타입과 선언된 타입이 다를 수 있기 때문에, 타입 정보를 유지하는데 방법을 고려해야 한다.

### 느낀점

기본적으로 타입스크립트 작성시 컴파일된 산출물(JS)을 예상하며 작성하는 방법이 올바른 타입체크를 하는데 도움이 될 것이라 생각한다.
