export type Table = {
  id: number
  name: string
  columns: Column[]
  rows: Row[]
}

export type Column = {
  id: number
  name: string
}

export type Row = {
  id: number
  fields: {
    [key: string]: string
  }
}
