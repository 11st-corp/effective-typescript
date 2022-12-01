# 아이템 53. 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

타입스크립트가 만들어지던 2010년에 자바스크립트는 결함이 많았고, 개선해야 할 부분이 많은 언어였다. 타입스크립트 초기 버전에는 독립적으로 클래스, 열거형(enum), 모듈 시스템을 포함시켰지만, 시간이 흐르면서 TC39는 부족했던 점들을 내장 기능으로 추가했다. 새로 추가된 기능들은 타입스크립트에서 호환성 문제가 발생했다. 

따라서, **TC39는 런타임 기능을 발전시키고, 타입스크립트 팀은 타입 기능만 발전시킨다는 명확한 원칙을 세우고 현재까지 지켜오고 있다.**

타입 공간(타입스크립트)과 값 공간(자바스크립트)의 경계를 혼란스럽게 만드는 타입스크립트 기능들은 사용하지 않는게 좋다.

### 열거형(enum)

```typescript
enum Flavor {
    VANILLA = 0,
    CHOCOLATE = 1,
    STRAWBERRY = 2,
}

let flavor = Flavor.CHOCOLATE;

Flavor     // 자동 완성 추천: VANILLA, CHOCOLATE, STRAWBERRY
Flavor[0]  // 값이 "VANILLA"
```

타입스크립트 열거형은 아래 상황에 따라 다르게 동작한다.

- 숫자 열거형에 0, 1, 2 외의 다른 숫자가 할당되면 매우 위험하다.
- 상수 열거형은 보통의 열거형과 달리 런타임에서 제거된다. `const enum Flavor`와 같이 const를 붙이면 `Flavor.CHOCOLATE` 가 0으로 바뀌어 버린다.
- `preserveConstEnums` 플래그를 설정하면 상수 열거형은 보통의 열거형처럼 런타임 코드에 열거형 정보를 유지한다.
- 문자형 열거형은 구조적 타이핑이 아닌 명목적 타이핑을 사용한다. (명목적 타이핑은 타입의 이름이 같이야 할당이 허용된다.)

#### 문자형 열거형의 명목적 타이핑

scoop 함수가 있다고 한다면, Flavor는 런타임때 문자열이기 때문에 자바스크립트에서 아래와 같이 호출된다.

```typescript
function scoop(flavor: Flavor){/* ... */}
```

```javascript
// javascript
scoop('vanilla');
```

그러나 타입스크립트에서는 열거형을 임포트하고 대신 사용해야한다.

```typescript
// typescript
scoop('vanilla'); // 'vanilla' 형식은 'Flavor' 형식의 매개변수에 할당 될 수 없습니다.

import {Flavor} from 'ice-cream';
scoop(Flavor.VANILLA); // 정상
```

자바스크립트와 타입스크립트의 동작이 다르기 때문에 문자열 열거형은 사용하지 않는게 좋다. 대신 리텉럴 타입과 유니온을 사용해서 해결할 수 있다.

```typescript
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';

let flavor: Flavor = 'chocolate';
```

### 매개변수 속성

```typescript
class Person {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}
```

타입스크립트는 더 간결하 문법을 제공한다.

```typescript
class Person {
    constructor(public name: string) {}
}
```

public name은 `매개변수 속성`이라고 부른다. `매개변수 속성`은 아래와 같은 몇가지 문제점이 존재한다.

- 일반적으로 타입스크립트 컴파일은 타입 제거가 이루어지므로 코드가 줄어들지만, 매개변수 속성은 코드가 늘어나는 문법이다.
- 매개변수 속성이 런타임에는 실제로 사용되지만, 타입스크립트 관점에서는 사용되지 않는 것처럼 보인다.
- 매개변수 속성과 일반 속성을 섞어서 사용하면 클래스의 설계가 혼란스러워 진다.

```typescript
class Person {
    first: string;
    last: string;
    constructor(public name: string) {
        [this.first, this.last] = name.split(' ');
    }
}
```

Person 클래스에는 세가지 속성(first, last, name)이 있지만, name은 매개변수 속성에 있어서 일관성이 없다. 아래와 같은 상황도 일어날 수 있다.

```typescript
class Person {
    constructor(public name: string) {}
}

const p: Person = {name: 'Jed Bartlet'}; // 정상
```

초급자에게는 생소한 문법이다. 따라서 일반 속성과 매개변수 속성 중 한 가지만 사용하자.

### 네임스페이스와 트리플 슬래시 임포트

타입스크립트는 자체적으로 모듈 시스템을 구축했고, 충돌을 피하기 위해 module과 같은 기능을 하는 namespace 키워드를 추가했다.

```typescript
namespace foo {
    function bar() {}
}

/// <reference path="other.ts"/>
foo.bar
```

트리플 슬래시 임포트와 module 키워드는 호환성을 위해 남아 있을 뿐이며, 이제는 ECMAScript 2015 스타일의 모듈(import와 export)를 사용해야 한다.

```typescript
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';

export default Flavor
```

```typescript
import type Flavor from '@/types/flavor'
```

### 데코레이터

데코레이터는 클래스, 메서드, 속성에 애너테이션을 붙이거나 기능을 추가하는데 사용할 수 있다.

```typescript
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }

    @logged
    greet() {
        return "Hello, " + this.greeting;
    }
}

function logged(target: any, name: string, descriptor: PropertyDescriptor) {
    const fn = target[name];
    descriptor.value = function() {
        console.log(`Calling ${name}`);
        return fn.apply(this, arguments);
    }
}

console.log(new Greeter('Dave').greet());
// 출력:
// Calling greet
// Hello, Dave
```

데코레이터는 처음에 앵귤러 프레임워크를 지원하기 위해 추가되었으며 tsconfig.json에 experimentalDecorators 속성을 설정하고 사용해야 한다. 현재까지도 표준화가 완료되지 않았기 때문에, 사용 중인 데코레이터가 비표준으로 바뀌거나 호환성이 깨질 수 있다. 따라서 사용하지 말자.

### 요약

- 일반적으로 타입스크립트 코드에서 모든 타입 정보를 제거하면 자바스크립트가 되지만, **열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 타입 정보를 제거한다고 자바스크립트가 되지 않는다.**
- 타입스크립트의 역확을 명확하게 하려면 **열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는** 사용하지 말자.