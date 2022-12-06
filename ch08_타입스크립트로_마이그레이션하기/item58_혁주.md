# 모던 자바스크립트로 작성하기

자바스크립트에서 타입스크립트로의 마이그레이션에서 어디서부터 시작해야할지 모르겠다면 옛날 버전의 자바스크립트 코드를 최신 버전의 자바스크립트로 바꾸는 작업부터 시작해보길 바랍니다.

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

ES2015부터는 import와 export를 사용하는 ECMAScript 모듈이 표준이 되었습니다.

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
