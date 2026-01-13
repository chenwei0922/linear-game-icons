'use client';

import * as SvgComs from '@yoroll/react-icon'
import { useState } from 'react'
import { IconAdd } from '@yoroll/react-icon'
// console.log(Object.entries(SvgComs))

export default function Home() {
  const [color, setColor] = useState('white')
  const [size, setSize] = useState(30)

  const onClick = (name: string) => {
    //复制
    navigator.clipboard.writeText(`<${name} size={30} color={'red'} />`)
    alert('已复制')
  }
  return (
    <main className="min-h-screen bg-white/20 p-10 flex flex-col">
      <div className='flex flex-row items-center justify-between'>
        <div className="flex flex-row items-center h-10 my-5">
          <div className="w-8 h-8 bg-[white]" onClick={() => setColor('white')} />
          <div className="w-8 h-8 bg-[orange]" onClick={() => setColor('orange')} />
          <div className="w-8 h-8 bg-[pink]" onClick={() => setColor('pink')} />
          <div className="w-8 h-8 bg-[blue]" onClick={() => setColor('blue')} />
        </div>
        <div className="flex flex-row items-center h-10 my-5 gap-1">
          <div className="w-8 h-8 bg-[gray] flex items-center justify-center" onClick={() => setSize(30)}>30</div>
          <div className="w-8 h-8 bg-[gray] flex items-center justify-center" onClick={() => setSize(24)}>24</div>
          <div className="w-8 h-8 bg-[gray] flex items-center justify-center" onClick={() => setSize(16)}>16</div>
          <div className="w-8 h-8 bg-[gray] flex items-center justify-center" onClick={() => setSize(12)}>12</div>
        </div>
      </div>
      <div className="w-auto flex flex-row flex-wrap">
        {/* <IconCreditFilled size={30} color={'red'} /> */}
        {Object.entries(SvgComs).map(([name, C], i) => {
          return (
            <div onClick={() => onClick(name)} key={i} className="px-2 cursor-pointer flex flex-col items-center justify-center w-25 p-3 border-[1px] border-white/20">
              <div className='w-full h-10 flex items-center justify-center'>{C && <C size={size} color={color} />}</div>
              <div className='w-full mt-3 h-10 flex  justify-center'><span className="text-white text-sm text-center break-all">{name}</span></div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
