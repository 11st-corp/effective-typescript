# 해당 분야의 용어로 타입 이름 짓기

> 엄선된 타입, 속성, 변수의 이름은 의도를 명확히하고 코드와 타입의 추상화 수준을 높여줍니다.

<br/>

```typescript
interface Animal {
    name: string;
    endangered: boolean;
    habitat: string;
}
```

- 동물을 표현하는데 있어서 `name`은 동물의 학명이 될 수도, 일반적인 명칭이 될 수 있기 때문에 해당 속성명으로는 의미가 모호하다.
- `endangered`는 멸종위기를 표현하려고 하였으나, 실제 멸종된 동물에 대해서는 표현할 수 없기 때문에 그 의미가 모호하다.
- `habitat`을 string 타입으로 두게되면, 기후의 종류와 표현하는 방식이 다양하기 때문에 모호하다. 

<br/>

```typescript
interface Animal {
    commonName: string;
    genus: string;
    species: string;
    staus: ConservationStatus;
    climates: KoppenClimate[];
}
```
- `name`을 구체적으로 일반적인 명칭과 동물의 학명을 각각 속성으로 나누어 표현하였다.
- `endangered` 단순 멸종위기 여부가 아닌, 동물 보호 등급이라는 표준 표기법을 사용하도록 변경하였다.
- `habitat` 값의 범위가 너무나도 넓기 때문에 쾨펜 기후 분류라는 표준 표기법을 사용하도록 변경하였다.

<br/>

> 표현하고자 하는 분야에 존재하는 전문 용어를 사용하면 모호함으로 인해 이전 개발자나 다른 사람들에게 추가적인 정보를 제공받을 필요가 없게됩니다.

#### 타입, 속성, 변수에 이름을 붙일 때, 명심해야 할 세 가지 규칙

1. 동일한 의미를 표현할 때 사용하는 용어는 반드시 통일해야한다.
2. `data`, `info`, `thing`, `item`, `object`, `entity`와 같이 의미가 없지만 단순히 접미사로는 사용하지 않는다. 
3. 계산 방식이 아닌 데이터에 집중한다. `INodeList` -> `Directory`

<br/>

### 정리하자면,

#### 변수, 타입, 속성의 이름을 사용할 때는 구현하고자 하는 분야에 전문적인 용어가 존재하는지 우선적으로 확인하고 가급적 사용한다.