# 타입과 인터페이스의 차이점 알기

타입스크립트에서 명명된 타입을 정의하는 방법은 두 가지가 있습니다.

- Type
- Interface

```typescript
type TState = {
  name: string;
  capital: string;
};

interface IState {
  name: string;
  capital: string;
}
```

> 앞으로의 예제에서는 Type과 Interface를 구분하기 위해 prefix(접두사)를 사용했지만, 실제 코드에서는 이렇게 사용하면 안 됩니다.(C#에서 영향을 받아서 초창기에는 이렇게 작성되었지만 지양해야 할 스타일로 여겨짐) FE개발팀에서도 기존의 prefix를 제거하는 방향으로 가고 있습니다.

대부분의 경우에는 타입을 사용해도 되고 인터페이스를 사용해도 됩니다. 그러나 둘 중 하나로 통일하여 일관성을 지키는 것이 중요합니다.

공통점과 차이점을 분명하게 알고 사용하는 것과 모르고 사용하는 것은 큰 차이가 있기에, 지금부터 공통점과 차이점을 알아보도록 하겠습니다.

<br/>

## 타입과 인터페이스의 공통점

제너릭이 가능합니다.

```typescript
type TPair<T> = {
  first: T;
  second: T;
};

interface IPair<T> {
  first: T;
  second: T;
}
```

클래스에서 구현(implements)이 가능합니다.

```typescript
class StateT implements TState {
  name: string = '';
  capital: string = '';
}

class StateI implements IState {
  name: string = '';
  capital: string = '';
}
```

확장이 가능하고, 인터페이스가 타입을 확장하거나 타입이 인터페이스를 확장할 수 있습니다.

```typescript
interface IStateWithPop extends TState {
  population: number;
}

type TStateWithPop = IState & { population: number }; //intersection type
```

> 주의: 인터페이스는 유니온 타입같은 복잡한 타입을 확장하지 못합니다. 따라서 복잡한 타입을 확장하고 싶다면 타입과 &를 활용해야 합니다.

<br/>

## 타입과 인터페이스의 차이점

타입만 유니온 타입을 사용할 수 있습니다.

```typescript
type AorB = 'A' | 'B';
```

- 보통의 경우 type 키워드가 interface보다 쓰임새가 많습니다.

인터페이스만 보강 기법을 사용할 수 있습니다.

```typescript
interface IState {
  name: string;
  capital: string;
}

interface IState {
  population: number;
}

const wyoming: IState = {
  name: 'Wyoming',
  capital: 'Cheyenne',
  population: 500000,
};

type TState = {
  // ~~~ Duplicate identifier 'TState'.
  name: string;
  capictal: string;
};

type TState = {
  // ~~~ Duplicate identifier 'TState'.
  population: number;
};
```

- 위 예제처럼 속성을 확장하는 것을 선언 병합(declaration merging)이라고 합니다.

<br/>

## 언제 어떤 것을 사용해야 할까?

- 복잡한 타입(ex 유니온 타입)이라면 타입을 사용하면 됩니다.

- 둘 다 사용가능한 경우

  1. 일관성: 일관되게 인터페이스를 사용하는 환경에서는 인터페이스를, 일관되게 타입을 사용하는 환경에서는 타입을 사용하면 됩니다

  2. 보강: 아직 스타일이 확립되지 않은 프로젝트라면 향후에 보강의 가능성이 있을지 생각해 봐야 합니다.
     - 어떤 **API**에 대한 타입 선언을 작성해야 한다면 인터페이스를 사용하는게 좋습니다. API가 변경될 때 사용자가 인터페이스를 통해 새로운 필드를 병합할 수 있어 유용하기 때문입니다.
     - 프로젝트 내부적으로 사용되는 타입에 선언 병합이 발생하는 것은 잘못된 설계입니다(간단하게 생각해봐도 오류를 발생시키기 쉬운 구조). 이럴 때는 타입을 사용해야 합니다.

## 결론

- 타입과 인터페이스의 공통점과 차이점을 이해하여 적재적소에 활용해야 합니다.
- 프로젝트에서 어떤 문법을 사용할지 결정할 때 한 가지 일관된 스타일을 확립해야 하고, 보강 기법이 필요한지 고려해야 합니다.
