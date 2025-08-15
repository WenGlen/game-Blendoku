// ====== 設定關卡參數 ======
const gameLevels = [
  {//Lv1
    rows: 1,
    cols: 3,
    fixedIndices: [0],
    colorOrder: ['#0c6b00', '#86a927', '#ffe14d']
  },
  {//Lv2
    rows: 3,
    cols: 3,
    fixedIndices: [0],
    colorOrder: [
      '#ff6a1a', '#ffac22', '#ffed29',
      'X', '#aaa04f', 'X',
      'X', '#55947d', 'X'
    ]
  },
  {//Lv3
    rows: 4,
    cols: 3,
    fixedIndices: [0, 2, 11],
    colorOrder: [
      '#ffffff', 'X', '#4ee9fd',
      '#ffedaa', '#c6e1ba', '#55c8d9',
      '#ffda55', 'X', '#5ca8b6',
      '#ffc800', 'X', '#638792'
    ]
  },
  {//Lv4
    rows: 3,
    cols: 3,
    fixedIndices: [0, 2, 5],
    colorOrder: [
      '#0c6b00', '#067354', '#007ba7',
      '#86a927', 'X', '#76bad3',
      '#ffe14d', '#f5f0a6', '#ebf9ff'
    ]
  },
  {//Lv5
    rows: 5,
    cols: 3,
    fixedIndices: [2, 10],
    colorOrder: [
    'X', 'X', '#009dff',
    'X', '#70828f', '#40adbf',
    '#c05f40', '#a08e60', '#80bd80',
    'X', '#cf9a30', '#bfcd40',
    'X', 'X', '#ffdd00'
    ]
  },
  {//Lv6
    rows: 4, cols: 5, fixedIndices: [1, 12,16],
    colorOrder: [
    'X', '#ffadad', '#ffb982', '#ffd12b', 'X',
    'X', 'X', '#b8b4a7', 'X', 'X',
    'X', 'X', '#72b0cb', 'X', 'X',
    '#2974ff', '#2a8ff8', '#2babf0', '#2cc6e9', '#2de1e1'
    ]
  },
  {//Lv7
    rows: 5, cols: 5, fixedIndices: [6, 13, 21],
    colorOrder: [
      'X', '#003166', '#706b5c', '#e0a552', 'X',
      'X', '#392975', 'X', '#79bc83', 'X',
      'X', '#732283', '#437b9b', '#12d3b3', 'X',
      'X', '#ac1a92', 'X', 'X', 'X',
      '#fd0080', '#e513a0', '#ce27c0', '#b63adf', '#9e4dff'
    ]
  },
  {//Lv8
    rows: 5, cols: 5, fixedIndices: [16, 19, 23],
    colorOrder: [
        'X', 'X', 'X', 'X', '#0a7194',
        'X', '#1158eb', '#2368d7', '#3478c3', '#4588af',
        'X', '#2088f2', 'X', 'X', '#809fca',
        'X', '#2fb7f8', 'X', 'X', '#bbb5e4',
        '#00eeff', '#3ee6ff', '#7bddff', '#b9d5ff', '#f6ccff'
    ]
  },
  {//Lv9
    rows: 5, cols: 3, fixedIndices: [3, 8, 12],
    colorOrder: [
        '#ffdd00', '#80be31', '#009e61',
        '#e4e640', 'X', '#369949',
        '#caee80', '#9bc159', '#6b9331',
        '#aff7bf', 'X', '#a18e18',
        '#94ffff', '#b5c480', '#d68800'
    ]
  },
  {//Lv10
    rows: 5, cols: 5, fixedIndices: [3, 21],
    colorOrder: [
        '#850000', '#6f3838', '#597171', '#43a9a9', '#2de1e1',
        'X', '#a3661c', 'X', 'X', 'X',
        'X', '#d69300', '#cbac3e', '#c1c47c', '#b6ddba',
        'X', 'X', '#b7a95e', 'X', '#bdb8a3',
        '#82ba71', '#92b078', '#a3a67e', '#b39c85', '#c3928b'
    ]
  }
];
