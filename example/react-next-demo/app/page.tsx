'use client';

import * as SvgComs from '@lineargame/react-icon'
import { CreditFilled } from '@lineargame/react-icon';
import { useState } from 'react'


export default function Home() {
  const [color, setColor] = useState('white')

  const onClick = (C: any) => {
    //复制
    navigator.clipboard.writeText(`<${C.name} size={30} color={'red'} />`)
    alert('已复制')
  }
  return (
    <main className="min-h-screen bg-white/20 p-10 flex flex-col">
      <div className="flex flex-row items-center h-10 my-5">
        <div className="w-8 h-8 bg-[white]" onClick={() => setColor('white')} />
        <div className="w-8 h-8 bg-[orange]" onClick={() => setColor('orange')} />
        <div className="w-8 h-8 bg-[pink]" onClick={() => setColor('pink')} />
        <div className="w-8 h-8 bg-[blue]" onClick={() => setColor('blue')} />
      </div>
      <div className="w-auto flex flex-row flex-wrap">
        {/* <CreditFilled size={30} color={'red'} /> */}
        {Object.values(SvgComs).map((C, i) => {
          return (
            <div onClick={() => onClick(C)} key={i} className="cursor-pointer flex flex-col items-center justify-center w-20 h-20 border-[1px] border-white/20">
              {C && <C size={30} color={color} />}
              <span className="text-white text-xs mt-2">{C.name}</span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
