# 모던 자바스크립트로 작성하기

자바스크립트에서 타입스크립트로의 마이그레이션에서 어디서부터 시작해야할지 모르겠다면?

> 옛날 버전의 자바스크립트 코드를 최신 버전의 자바스크립트로 바꾸는 작업부터 시작해보길 바랍니다.

타입스크립트는 자바스크립트의 상위집합이기 때문에, 코드를 최신 버전으로 바꾸다 보면 타입스크립트의 일부를 저절로 익힐 수 있게 됩니다.

이번 아이템에서 소개할 내용들은 모두 ES2015(일명 ES6) 버전부터 도입된 것입니다.

타입스크립트를 도입할 때 가장 중요한 기능은 **ECMAScript 모듈**과 **ES2015 클래스**입니다.

## ECMAScript 모듈 사용하기

ES2015 이전에는 코드를 개별 모듈로 분할하는 표준 방법이 없었습니다.

지금은 개별 모듈로 분할하는 방법이 많아졌습니다.

- 여러 개의 `<script>` 태그를 사용하기
- 직접 갖다 붙이기(manual concatenation)
- Makefile 기법
- NodeJS 스타일의 require 구문
- AMD 스타일의 define 콜백

> ES2015부터는 import와 export를 사용하는 ECMAScript 모듈이 표준이 되었습니다.

만약 마이그레이션 대상인 자바스크립트 코드가 단일 파일이거나 비표준 모듈 시스템을 사용중이라면 ES 모듈로 전환하는 것이 좋습니다. 그리고 ES 모듈 시스템을 사용하기 위해서 프로젝트 종류에 따라 webpack이나 ts-node 같은 도구가 필요할 수 있습니다.

ES 모듈 시스템은 타입스크립트에서도 잘 동작하며, 모듈 단위로 전환할 수 있게 해 주기 때문에 점진적 마이그레이션이 원활해집니다.

CommonJS 모듈 시스템을 사용한 전형적인 예제

```typescript
// CommonJS
// a.js
const b = require('./b');
console.log(b.name);

// b.js
const name = 'Module B';
module.exports = { name };
```

동일한 기능을 하는 코드를 ES 모듈로 표한하면

```typescript
// ECMAScript module
// a.ts
import * as b from './b';
console.log(b.name);

// b.ts
export const name = 'Module B';
```

## 프로토타입 대신 클래스 사용하기

ES2015에 class 키워드를 사용하는 클래스 기반 모델이 도입되었습니다.

마이그레이션하려는 코드에서 단순한 객체를 다룰 때 프로토타입을 사용하고 있었다면 클래스로 바꾸는 것이 좋습니다.

```typescript
function Person(first, last) {
  this.first = first;
  this.last = last;
}

Person.prototype.getName = function () {
  return this.first + ' ' + this.last;
};

const marie = new Person('Marie', 'Curie');
const personName = marie.getName();
```

```typescript
class Person {
  first: string;
  last: string;

  constructor(first: string, last: string) {
    this.first = first;
    this.last = last;
  }

  getName() {
    return this.first + ' ' + this.last;
  }
}

const marie = new Person('Marie', 'Curie');
const personName = marie.getName();
```

프로토타입으로 구현한 Person 객체보다 클래스로 구현한 Person 객체가 문법이 간결하고 직관적입니다.

또한 편집기에서 Convert function to an ES2015 class를 선택하면 간단히 클래스 객체로 변환할 수 있습니다.(how?)

## var 대신 let/const 사용하기

자바스크립트 var 키워드는 스코프 규칙에 문제가 있습니다.

let과 const는 제대로 된 블록 스코프 규칙을 가집니다.

만약 var 키워드를 let이나 const로 변경하면, 일부 코드에서 타입스크립트가 오류를 표시할 수도 있습니다. 오류가 발생한 부분은 잠재적으로 스코프 문제가 존재하는 코드이기 때문에 수정해야 합니다.

중첩된 함수 구문에도 var의 경우와 비슷한 스코프 문제가 존재합니다. 예를 들어보겠습니다.

```typescript
function foo() {
  bar();
  function bar() {
    console.log('hello');
  }
}
```

foo 함수를 호출하면 bar 함수의 정의가 호이스팅 되어 가장 먼저 수행되기 때문에 bar 함수가 문제없이 호출되고 hello가 출력됩니다.

호이스팅은 실행 순서를 예상하기 어렵게 만들고 직관적이지 않습니다.

대신 함수 표현식 `const bar = () => {...}`을 사용하여 호이스팅 문제를 피하는 것이 좋습니다.

## for(;;) 대신 for-of 또는 배열 메서드 사용하기

과거에는 C 스타일의 for 루프를 사용했습니다.

```typescript
for (var i = 0; i < array.length; i++) {
  const el = array[i];
  //...
}
```

모던 자바스크립트에서는 for-of 루프가 존재합니다.

```typescript
for (const el of array) {
  //...
}
```

코드도 짧고 인덱스 변수를 사용하지도 않아서 실수를 줄일 수 있습니다.

인덱스 변수가 필요한 경우엔 forEach 메서드를 사용하면 됩니다.

```typescript
array.forEach((el, i) => {
  //...
});
```

for-in 문법도 존재하지만 몇 가지 문제점이 있기 때문에 사용하지 않는 것이 좋습니다. (아이템 16 참고)

- 대표적으로 다른 순회방법보다 몇 배나 느립니다.

## 함수 표현식보다 화살표 함수 사용하기

this 키워드는 일반적인 변수들과는 다른 스코프 규칙을 가집니다.

예를 들어보겠습니다.

```typescript
class Foo {
  method() {
    console.log(this);
    [1, 2].forEach(function (i) {
      console.log(this);
    });
  }
}
const f = new Foo();
f.method();
// Foo, undefined, undefined
```

대신 화살표 함수를 사용하면 상위스코프의 this를 유지할 수 있습니다.

```typescript
class Foo {
  method() {
    console.log(this);
    [1, 2].forEach((i) => {
      console.log(this);
    });
  }
}
const f = new Foo();
f.method();
// Foo, Foo, Foo
```

인라인 혹은 콜백 함수보다 화살표 함수가 더 직관적이며 간결하기 때문에 가급적 화살표 함수를 사용하는 것이 좋습니다.

추가로 컴파일러 옵션에 noImplicitThis 또는 strict를 설정하면 타입스크립트가 this 바인딩 관련 오류를 표시해주기 때문에 설정하는 것이 좋습니다.

## 단축 객체 표현과 구조 분해 할당 사용하기

### 단순 객체 표현

pt라는 객체를 생성하는 예시를 보겠습니다.

```typescript
const x = 1,
  y = 2,
  z = 3;

const pt = {
  x: x,
  y: y,
  z: z,
};
```

변수와 객체 속성의 이름이 같다면, 간단하게 다음 코드처럼 작성할 수 있습니다.

```typescript
const x = 1,
  y = 2,
  z = 3;
const pt = { x, y, z };
```

중복된 이름을 생략하기 때문에 가독성이 좋고 실수가 적어집니다.

화살표 함수 내에서 객체를 반환할 때는 소괄호로 감싸야 합니다. 함수의 구현부에는 블록이나 단일 표현식이 필요하기 때문에 소괄호로 감싸서 표현식으로 만들어 준 것입니다.

```typescript
['A', 'B', 'C'].map((char, idx) => ({ char, idx }));
// [ { char: 'A', idx: 0 }, { char: 'B', idx: 1 }, { char: 'C', idx: 2 } ]
```

객체의 속성 중 함수를 축약해서 표현하는 방법은 다음과 같습니다.

```typescript
const obj = {
  onClickLong: function (e) {
    // ...
  },
  onClickCompact(e) {
    // ...
  },
};
```

### 구조 분해 할당

단순 객체 표현(compact object literal)의 반대는 객체 구조 분해(object destructuring) 입니다.

```typescript
// 일반적
const props = obj.props;
const a = props.a;
const b = props.b;

// 구조분해로 줄여서
const { props } = obj;
const { a, b } = props;

// 극단적
const {
  props: { a, b },
} = obj; // 주의: 여기서 props는 변수로 선언된 것이 아님
```

구조 분해 문법에서는 기본법을 지정할 수 있습니다.

```typescript
let { a } = obj.props;
if (a === undefined) a = 'default';
```

대신 구조 분해 문법 내에서 아래와 같이 기본값을 지정할 수 있습니다.

```typescript
const { a = 'default' } = obj.props;
```

배열에서도 구조 분해 문법을 사용할 수 있습니다. 튜플처럼 사용하는 배열에서 특히 유용합니다.

```typescript
const point = [1, 2, 3];
const [x, y, z] = point;
const [, a, b] = point; // 첫 번째 요소 무시
```

함수 매개변수에서도 사용 가능합니다.

```typescript
const points = [
  [1, 2, 3],
  [4, 5, 6],
];

points.forEach(([x, y, z]) => console.log(x + y + z));
```

단축 객체 표현과 마찬가지로 객체 구조 분해를 사용하면 문법이 간결해지고 변수를 사용할 때 실수를 줄일 수 있게 때문에 적극적으로 사용하는 것을 권장합니다.
