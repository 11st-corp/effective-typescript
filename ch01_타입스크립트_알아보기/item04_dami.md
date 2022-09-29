# 아이템 4. 구조적 타이핑에 익숙해지기

자바스크립트는 덕 타이핑(`Duct Typing`) 기반입니다.덕 타이핑은 클래스 상속이나 인터페이스 구현으로 타입을 구분하는 대신,덕 타이핑은 객체가 어떤 타입에 걸맞은 변수와 메소드를 지니면 객체를 해당 타입에 속하는 것으로 간주합니다.

## 덕 타이핑

```ts
interface Developer {
  name: string;
  study(): void;
}

class FrontendDeveloper implements Developer {
  name = "dami";
  study = () => {
    console.log(`${this.name}는 공부중`);
  };
}

class Robot {
  name = "reactbot";
  study = () => {
    console.log(`${this.name}도 공부중`);
  };
}

const frontendDeveloperInstance = new FrontendDeveloper();
const robotInstance = new Robot();

function doSometing(developer: Developer): void {
  developer.study();
}

doSometing(frontendDeveloperInstance); //(1) "dami는 공부중"
doSometing(robotInstance); //(2) "reactbot도 공부중"
```

위 예제의 (1)번의 함수호출을 보면 `frontendDeveloperInstance`로 `doSometing`을 실행하는 것은 에러가 발생할 것으로 예상되지 않습니다.
`doSometing`의 파라미터인 `developer`은 `Developer` 타입을 만족해야하는데
`FrontendDeveloper` 클래스는 `Developer` 인터페이스로 구현되었고,
`frontendDeveloperInstance`는 `FrontendDeveloper` 클래스의 인스턴스이기 때문입니다.

반면 (2)번의 함수호출을 보면, 파라미터로 들어간 `robotInstance`가 `Developer` 인터페이스로 정의되어 있지 않기 때문에 타입 에러가 발생 할 것 같은데 에러가 발생하지 않습니다. 여기서 타입스크립트의`덕 타이핑(Duct Typing)` 개념이 적용됩니다. `Robot` 클래스가 `Developer` 인터페이스를 `implements` 한 것은 아니지만 `Developer` 타입이 요구하는 `name` 프로퍼티와 `study` 메서드를 가지고 있고, `robotInstance`는 이 클래스의 인스턴스 이기때문에 타입 체크를 통과하게 됩니다.

## 구조적 타이핑

타입스크립트는 이렇게 자바스크립트 superset이기 때문에 이 특성을 그대로 따르기 때문에 타입스크립트의 타입시스템은 '구조적으로' 타입이 맞기만 한다면 타입 에러는 발생시키지 않습니다. 이러한 특성을 `구조적 타이핑(structural typing)`이라 부릅니다.

따라서 타입스크립트가 구조적 타이핑을 이해한다면 보다 결과를 예측하기 쉬워질 수 있습니다. 위의 덕 타이핑 예제에서 본 것 처럼 타입스크립트는 타입 확장에 대해 '열려' 있습니다. 명확한 상속관계(A - B)를 지향하는 명목적 타이핑과 다르게 구조적 타이핑은 `집합`으로 포함한다는 개념을 지향합니다.

```ts
interface Vector2D {
  x: number;
  y: number;
}

function calculateLength(v: Vecotr2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

const v: NamedVector = { x: 3, y: 4, name: "zee" };
calculateLength(v); // OK , 결과 5
```

위 예제에서 처럼 `Vector2D`와 `NamedVector`의 관계를 선언하지 않았음에도 `NamedVector`의 구조가 `Vector2D`와 호환되기 때문에 `calculateLength` 호출시 타입 에러가 발생하지 않습니다.

### 구조적 타이핑의 장점

- 테스트를 작성할 때는 구조적 타이핑이 유리함
- 라이브러리 간의 의존성을 완벽하게 분리할 수 있음 (item 51에서 계속)

```ts
interface PostgresDB {
  //엄청 길고 복잡함
  //..
  runQuery: (sql: string) => any[];
}
interface Author {
  first: string;
  last: string;
}

function getAuthors(db: PostgresDB): Author[] {
  // authors 리턴 하는 로직
}
```

`PostgresDB`를 테스트 한다고 할 때 테스트 코드에는 실제 환경에 대한 정보가 필요하지 않습니다. `getAuthors` 함수를 테스트 하기 위해서 함수 파라미터를 `PostgresDB`라는 실제 DB 구조에 대한 인터페이스가 아니라 구조적 타이핑 개념을 활용해서 좀 더 구체적인 인터페이스로 정의하는 것이 나은 방법입니다.

```ts
interface DB {
  runQuery: (sql: string) => any[];
}

function getAuthors(db: DB): Author[] {
  // authors 리턴 하는 로직
}
```

`DB` 인터페이스에 `runQuery` 메서드가 있기 때문에 실제 환경에서도 `getAuthors`에 `PostgresDB`를 사용할 수 있습니다. 구조적 타이핑 덕분에 `PostgresDB`의 인터페이스를 명확히 선언할 필요가 없습니다. 추상화(`DB`)를 함으로써, 로직과 테스트를 특정한 구현(`PostgresDB`)으로 분리한 것입니다.

## 결론

타입스크립트는 구조적 타이핑이 가능하다. 타입스크립트의 유연한 특성을 잘 이해하고 사용하자.
