# string 타입보다 구체적인 타입 사용하기

string 타입의 경우, 값의 범위가 매우 크기 때문에 any와 유사한 문제가 발생할 수 있다. 단순히 string 타입을 정의하는 것 보다 명확한 의미와 범위가 존재한다면 값의 유니온 타입으로 정의하는 것이 더 좋다.

```typescript
interface AlbumPre {
    artist: string;
    title: string;
    releaseDate: string;
    recordingType: string;
}
```
- AlbumPre의 모든 속성의 타입은 string이다. 
- releaseDate 속성의 경우, 날짜의 의미를 담은 string 타입으로 'YYYY-MM-DD', 'YYMMDD'등으로 문자열의 형식이 제한되어있지 않기 때문에 유효성 검사가 쉽지 않다.
- recordingType 속성의 경우, 실제 해당 속성의 의도는 'studio' 'live' 두 개의 값으로 표현이 가능하지만 string을 사용하고 있다. 


```typescript
type RecordingType = 'studio' | 'live';

interface Album {
    artist: string;
    title: string;
    releaseDate: Date;
    recordingType: RecordingType;
}
```
- releaseDate 속성이 표현할 수 문자열 형식과 무관하게 날짜의 의미를 가질 수 있도록 Date 객체 타입으로 변경하였다.
- recordingType 속성이 가질 수 있는 문자열 값을 유니온을 통해 타입의 범위를 줄였다.

### 구체적인 타입을 통해서 타입의 범위를 좁힐 때의 장점


#### 1. 객체의 속성을 독립적으로 사용할 때 그 의미가 명확하게 전달된다. 

```typescript
type getAlbumsOfType = (recordingType: string) => Album[];

type RecordingType = 'studio' | 'live';
type getAlbumsOfType = (recordingType: RecordingType) => Album[];
```
- 위 함수의 경우, 전달하는 값이 Album 객체의 recordingType 속성으로 '녹음 유형'이라는 의미를 가지지만 string 타입이므로 해당 함수 시그니처로는 단순히 문자열이 전달된다는 의미만 해석할 수 있다.  
- 아래의 함수의 경우, 인자가 RecordingType 타입으로 '녹음 유형'이라는 의미를 명확하게 전달함으로써 'studio' 또는 'live' 문자열만을 가질 수 있다는 의미를 추가적으로 전달할 수 있다.

<br/>

#### 2. 타입에 대한 주석을 편집기를 통해 확인할 수 있다.

```typescript
/* 이 녹음은 어떤 환경에서 이루어졌는가? */
type RecordingType = 'studio' | 'live';

type getAlbumsOfType = (recordingType: RecordingType) => Album[];
```

- 편집기를 통해서 함수 시그니처에서 RecordingType에 대한 설명, 이 녹음은 어떤 환경에서 이루어졌는가?'를 확인할 수 있다.

<br/>

#### 3. keyof 연산자로 더욱 세밀하게 객체의 속성 체크가 가능하다.

객체의 속성을 사용하는 경우, 발생하는 문제를 조금 더 명확한 타입을 정의함으로써 해결할 수 있다. 예제를 위해 객체를 인자로 받아 해당 객체의 속성을 사용하는 함수를 구현하였다.

```typescript
function pluck<T>(records: T[], key: string): any[] {
    return records.map(r => r[key]);
}
```

- key 인자는 T객체의 속성명으로 사용하려고 하였으나, `r[key]`에서 속성명의 타입보다 string의 타입이 더 범위가 넓기 때문에 오류가 발생한다. 예를 들어 위의 Album 객체를 사용한다고 하였을 때, 가질 수 있는 속성명은 `'artist'`, `'title'`, `'releaseDate'`, `'recordingType'` 총 네가지의 문자열이지만 string 타입은 이 값 이외의 모든 문자열이 가능하다. 
- 이를 명확하게 하기 위해 string 타입 대신 `keyof`를 사용하여 타입의 범위를 줄인다.

```typescript
function pluck<T>(records: T[], key: keyof T):T[keyof T][] {
    return records.map(r => r[key]);
}

const albums: Album[] = [
    {
        artist: 'chanwoo',
        title:'sea',
        releaseDate: new Date('2022-03-02'),
        recordingType: 'studio'
    }
]

const releaseDates = pluck(albums, 'releaseDate'); // (string | Date)[]
```

- key 속성의 타입을 `keyof T`를 통해서 `'artist' | 'title' | 'releaseDate' | 'recordingType'` 으로 타입의 범위를 제한하였다.
- 하지만 반환값의 타입이 `T[keyof T]`은 T의 모든 속성값이므로 `string | Date`가 된다. 이는 단일 속성의 값의 배열을 가져야하는 반환값의 의도와는 차이가 존재한다.
- `K extends keyof T`를 통해서 `keyof T`의 유니온 타입에서 단 하나의 타입만을 가지도록 K를 추출해 사용한다.

```typescript
function pluck<T, K extends keyof T>(records: T[], key: K): T[K][] {
    return records.map(r => r[key]);
}
```
<br/>

### 정리하자면,

#### 1. 단순히 `string` 타입을 사용하는 것이 아니라 유니온 타입을 통해 의도에 맞게 타입의 범위를 제한하여 사용한다.

#### 2. 객체의 속성을 인자로 사용할 때는 `string`이 아닌 `typeof`를 사용하여 의도에 맞게 타입의 범위를 제한하여 사용한다.

