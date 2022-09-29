# 아이템 8. 타입 공간과 값 공간의 심벌 구분하기

타입스크립트의 심벌(symbol)은 이름이 같더라도 속하는 공간에 따라 타입일 수도 값일 수도 있기에 혼란스러울 수 있습니다.

```typescript
interface Cylinder {
  radius: number;
  height: number;
} // 타입
 
const Cylinder = (radius: number, height: number) => ({radius, height}); // 값
```

위 예제에서 `interface Culinder`는 `타입`, `const Cylinder`는 `값`으로 쓰입니다. 이런 점이 오류를 야기할 수 있습니다.

```typescript
function calculateVolume(shape: unknown){
  if(shape instanceof Cylinder) {
    shape.radius
    // 오류 : '{}' 형식에 'radius' 속성이 없습니다.
  }
}
```

`instance of`는 자바스크립트의 런타임 연산자이고, 값에 대해서 연산을 하기에 `instance of Cylinder`는 타입이 아니라 함수를 참조합니다.

```typescript
type T1 = 'string literal';
type T2 = 123;

const v1 = 'string literal';
const v2 = 123;
```

`type` 이나 `interface` 다음에 나오는 심벌은 타입인 반면 `const`, `let` 선언에 쓰이는 것은 값입니다. 타입스크립트 코디에서 타입과 값은 번갈아 나올 수 있습니다. 

- `타입 선언(:)` 또는 `단언문(as)` 다음에 나오는 심벌은 `타입`
- `=` 다음에 나오는 모든 것은 `값`

`class`와 `enum`은 상황에 따라 `타입` 과 `값` 두가지 모두 가능한 **예약어**입니다. 

```typescript
class Cylinder {
  radius = 1;
  height = 1;
}

function calculateVolume(shape: unknown){
  if(shape instanceof Cylinder) {
    shape // 정상, 타입은 Cylinder
    shape // 정상, 타입은 number
  }
}
```

- 클래스가 `타입`으로 쓰일 때 : `형태(속성, 메서드)` 가 사용
- 클래스가 `값`으로 쓰일 때 : `생성자`가 사용



```typescript
type T1 = typeof p;  // 타입은 Person
type T2 = typeof email; // 타입은 

const v1 = typeof p; // 값은 "object"
const v2 = typeof email; // 값은 "function"
```

**타입의 관점에서** 

- `typeof` 는 값을 읽어서 타입스크립트 타입을 반환
- 타입 공간의 `typeof` 는 보다 큰 타입의 일부분으로 사용 가능
- `type` 구문으로 이름을 붙이는 용도로 사용 가능 



**값의 관점에서**

- 자바스크립트 런타임의 `typeof` 연산자
- 대상 심벌의 런타임 타입을 가리키는 문자열을 반환 
- 자바스크립트 런타임 타입 6개 :`string`, `number`, `boolean`, `undefined`, `object`, `function`



```typescript
class Cylinder {
  radius = 1;
  height = 1;
}
const v = typeof Cylinder; // 값이 "function"
type T = typeof Cylinder; // 타입이 typeof Cylinder
```



```typescript
declare let fn: T;
const c = new fn(); // 타입이 Cylinder

type C = InstanceType<typeof Cylinder>; // 타입이 Cylinder
```

위 예제처럼 `InstanceType` 제네릭을 사용해 생성자 타입과 인스턴스 타입을 전환할 수 있습니다. 



타입의 속성을 얻을 때는 `obj.field`가 아니라 반드시 `obj['field']` 를 사용해야 합니다. 두 방법으로 얻은 값은 동일하더라도 **타입은 다를 수 있기 때문**입니다.

인덱스 위치에는 `유니온 타입`과 `기본형 타입`을 포함한 **어떠한 타입이든 사용**할 수 있습니다.

```typescript
type PersonEl = Person['first' | 'last']; // 타입은 string
type Tuple = [string, number, Date]; // 타입은 string | number | Date
```

## 두 공간 사이에서 다른 의미를 가지는 코드 패턴

### this

- 값으로 쓰이는 `this`는 자바스크립트의 `this` 키워드입니다.
- 타입으로 쓰이는 `this`는 `다형성(polumorphic)` `this`라고 불리는 `this`의 타입스크립트 타입입니다. 서브클래스의 메서드 체인을 구현할 때 유용합니다.

### `&` 와 `|`

- 값: `AND`와 `OR` 비트연산
- 타입: `인터섹션`과 `유니온`

### const, as const

- `const`: 새 변수를 선언 
- `as const`: 리터럴 또는 리터럴 표현식의 추론된 타입을 바꿉니다.

### extends

- 서브클래스 (`class A extends B`)
- 서브타입 (`interface A extends B`)
- 제너릭 타입의 한정자를 정의할 수 있습니다. (``Generic<T extends number>``)

### in 

- 루프 (`for (key in object)`) 또는 매핑된 타입(`mapped`)에 등장합니다.



타입스크립트 코드가 잘 동작하지 않는다면 타입 공간과 값 공간을 혼동해서 작성했을 가능성이 큽니다. 예를 들어, 단일 객체 매개변수를 받도록 email 함수를 변경했다고 생각해 보겠습니다.

```typescript
function email(options: { person: Person, subject: string, body: string }) {
  //...
}
```

자바스크립트에서는 객체 내의 각 속성을 로컬 변수로 만들어 주는 구조 분해(`destructuring`) 할당을 사용할 수 있습니다. 

```typescript
function email({ person, subject, body }){
  //...
}
```

그런데 타입스크립트에서 구조 분해 할당을 하면, 이상한 오류가 발생합니다.

```typescript
function email({
  person: Person, // 오류: ~~바인딩 요소 'Person'에 암시적으로 'any' 형식이 있습니다.
  subject: string, // 'string' 식별자가 중복되었습니다.
                   // 오류: ~~바인딩 요소 'Person'에 암시적으로 'any' 형식이 있습니다.
  subject: string, // 'string' 식별자가 중복되었습니다.
                   // 오류: ~~바인딩 요소 'Person'에 암시적으로 'any' 형식이 있습니다.
})
```

값의 관점에서 `Person`과`string`이 해석되었기 때문에 오류가 발생했습니다. `Person`이라는 변수명과 `string`이라는 이름을 가지는 두 개의 변수를 생성하려한 것입니다. 문제를 해결하려면 **타입과 값을 구분해야합니다.**

```typescript
function email({ person, subject, body }: { person: Person, subject: string, body: string }){
  //...
}
```

위와 같이 객체 자체에 대해 `type`을 지정해줘야 합니다. 



## 더 생각해볼 거리: interface, type 네이밍 컨벤션 

타입스크립트에서 interface를 정의할때 I-prefix를 붙이는 것은 권장되지 않는 추세입니다.

### 일관성을 파괴하는 네이밍 컨벤션
하나의 프로젝트 (또는 어떤 다른 기준)에서 snake_case를 사용한다던가, camelCase를 사용한다던가 이런 표기법은 일관성이 가장 중요합니다.
다른 변수나 함수 네이밍에는 헝가리식 표기법을 적용하지 않다가, 인터페이스에만 헝가리식 표기법을 적용하는 것은 잘못된 것입니다.

### 컨벤션의 목적과 사용되는 언어가 근본적으로 맞지 않는 문제
자바스크립트와 같은 언어에서 변수 또는 함수에 자료형을 드러내기 위해서 사용하던 헝가리식 표기법을 구조적 타이핑을 기반으로 하는 타입스크립트에 적용하는 것은 더욱 말이 안됩니다.

출처: [타입스크립트에서 interface 정의시 I- prefix를 권장하지 않는 이유](https://zereight.tistory.com/948)



## 결론

타입스크립트를 사용할 때는 값인지 타입인지 맥락을 잘 이해해서 적용하자.
