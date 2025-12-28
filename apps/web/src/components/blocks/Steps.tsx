/**
 * Steps block component for KapwaNet.
 *
 * Displays numbered process steps with different visual variants.
 */

import React from 'react'
import type { StepsBlock, StepItem } from './types'

interface StepsProps {
  block: StepsBlock
}

/**
 * Numbered step component.
 */
function NumberedStep({ step, index }: { step: StepItem; index: number }) {
  const number = step.number ?? index + 1

  return (
    <div className="flex gap-4 items-start">
      {/* Step number */}
      <div
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-white"
        style={{ backgroundColor: 'var(--kn-primary)' }}
      >
        {number}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
        >
          {step.title}
        </h3>
        {step.description && (
          <p style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}>
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Icon step component.
 */
function IconStep({ step }: { step: StepItem }) {
  return (
    <div className="text-center">
      {/* Icon */}
      {step.icon && (
        <div
          className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 text-2xl"
          style={{ backgroundColor: 'var(--kn-primary)', color: '#ffffff' }}
        >
          {step.icon}
        </div>
      )}

      {/* Content */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
      >
        {step.title}
      </h3>
      {step.description && (
        <p style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}>
          {step.description}
        </p>
      )}
    </div>
  )
}

/**
 * Timeline step component.
 */
function TimelineStep({ step, index, isLast }: { step: StepItem; index: number; isLast: boolean }) {
  const number = step.number ?? index + 1

  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white text-sm z-10"
          style={{ backgroundColor: 'var(--kn-primary)' }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-[40px]"
            style={{ backgroundColor: 'var(--kn-muted)' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
        >
          {step.title}
        </h3>
        {step.description && (
          <p style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}>
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Steps block component.
 */
export function Steps({ block }: StepsProps) {
  const { title, subtitle, steps, variant = 'numbered' } = block

  return (
    <section
      className="px-4 py-12 max-w-4xl mx-auto"
      data-block-type="steps"
      data-block-id={block.id}
    >
      {/* Section header */}
      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && (
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Steps list */}
      {variant === 'numbered' && (
        <div className="space-y-8">
          {steps.map((step, index) => (
            <NumberedStep key={step.id} step={step} index={index} />
          ))}
        </div>
      )}

      {variant === 'icon' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <IconStep key={step.id} step={step} />
          ))}
        </div>
      )}

      {variant === 'timeline' && (
        <div className="pl-4">
          {steps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Steps
