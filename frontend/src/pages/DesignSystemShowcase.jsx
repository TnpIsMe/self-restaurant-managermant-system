import React from 'react'

/**
 * Design System Component Showcase
 *
 * This file demonstrates the professional design system
 * for Self Restaurant. Copy and use these patterns in your components.
 */

export function DesignSystemShowcase() {
  return (
    <div className="space-y-12 p-8 max-w-4xl mx-auto">
      {/* Typography */}
      <section>
        <h2>Typography</h2>
        <div className="space-y-4 mt-6">
          <div>
            <h1>Heading 1 - Page Title</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">36px Bold</p>
          </div>
          <div>
            <h2>Heading 2 - Section Title</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">30px Bold</p>
          </div>
          <div>
            <h3>Heading 3 - Subsection</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">24px Bold</p>
          </div>
          <div>
            <p>Body text - 16px Normal. This is standard paragraph text used throughout the application for descriptions and content.</p>
          </div>
          <div>
            <small>Small text - 14px. Used for secondary information and helper text.</small>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2>Buttons</h2>
        <div className="space-y-6 mt-6">
          {/* Primary */}
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Primary Buttons</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary btn-lg">Large Primary</button>
              <button className="btn-primary btn-md">Medium Primary</button>
              <button className="btn-primary btn-sm">Small Primary</button>
              <button className="btn-primary btn-xs">Extra Small</button>
              <button className="btn-primary" disabled>Disabled</button>
            </div>
          </div>

          {/* Secondary */}
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Secondary Buttons</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-secondary btn-lg">Large Secondary</button>
              <button className="btn-secondary btn-md">Medium Secondary</button>
              <button className="btn-secondary btn-sm">Small Secondary</button>
            </div>
          </div>

          {/* Semantic */}
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Semantic Buttons</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-success">Success</button>
              <button className="btn-danger">Danger</button>
              <button className="btn-warning">Warning</button>
              <button className="btn-info">Info</button>
              <button className="btn-ghost">Ghost</button>
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section>
        <h2>Forms</h2>
        <div className="space-y-4 mt-6 max-w-md">
          <div>
            <label className="label">Employee ID <span className="text-danger">*</span></label>
            <input type="text" className="input" placeholder="e.g., BT001" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Enter password" />
          </div>
          <div>
            <label className="label">With Error</label>
            <input type="text" className="input input-error" placeholder="Error state" />
            <p className="text-xs text-danger mt-1">This field has an error</p>
          </div>
          <div>
            <label className="label">With Success</label>
            <input type="text" className="input input-success" placeholder="Success state" value="Valid input" readOnly />
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2>Badges</h2>
        <div className="space-y-4 mt-6">
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-danger">Danger</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-info">Info</span>
            <span className="badge badge-gray">Gray</span>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2>Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <div className="card-header">
              <h4>Card with Header</h4>
            </div>
            <div className="card-body">
              This card demonstrates proper structure with header, body, and footer sections.
            </div>
            <div className="card-footer">
              <button className="btn-primary btn-sm">Action</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4 className="mb-2">Card Body Only</h4>
              This card only contains a body section without header or footer.
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2>Alerts</h2>
        <div className="space-y-3 mt-6">
          <div className="alert alert-primary">
            <span>ℹ️</span>
            <div>
              <p className="font-medium">Info Alert</p>
              <p className="text-sm">This is informational content for the user.</p>
            </div>
          </div>
          <div className="alert alert-success">
            <span>✓</span>
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm">Your action was completed successfully.</p>
            </div>
          </div>
          <div className="alert alert-warning">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Warning</p>
              <p className="text-sm">Please review this information carefully.</p>
            </div>
          </div>
          <div className="alert alert-danger">
            <span>✕</span>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">Something went wrong. Please try again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Indicators */}
      <section>
        <h2>Status Indicators</h2>
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3">
            <span className="status-dot status-online"></span>
            <span>Online / Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-dot status-busy"></span>
            <span>Busy / In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-dot status-offline"></span>
            <span>Offline / Inactive</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-dot status-error"></span>
            <span>Error / Critical</span>
          </div>
        </div>
      </section>

      {/* Color System */}
      <section>
        <h2>Color System</h2>
        <div className="space-y-6 mt-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Primary Colors</p>
            <div className="flex gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(i => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-lg bg-primary-${i} flex items-center justify-center text-xs font-medium`}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Semantic Colors</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg bg-success/20 mx-auto mb-2"></div>
                <p className="text-sm font-medium">Success</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg bg-warning/20 mx-auto mb-2"></div>
                <p className="text-sm font-medium">Warning</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg bg-danger/20 mx-auto mb-2"></div>
                <p className="text-sm font-medium">Danger</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg bg-info/20 mx-auto mb-2"></div>
                <p className="text-sm font-medium">Info</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2>Spacing System</h2>
        <div className="space-y-4 mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Base unit: 4px (multiples of 4px)</p>
          <div className="space-y-2">
            {[
              { token: '1', value: '4px' },
              { token: '2', value: '8px' },
              { token: '3', value: '12px' },
              { token: '4', value: '16px' },
              { token: '6', value: '24px' },
              { token: '8', value: '32px' },
            ].map(({ token, value }) => (
              <div key={token} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">p-{token} ({value})</div>
                <div className={`bg-primary-500 p-${token}`} style={{ minWidth: `calc(${value} * 4)` }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section>
        <h2>Best Practices</h2>
        <div className="card mt-6">
          <div className="card-body space-y-4">
            <div>
              <h5 className="mb-2">✓ DO</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Use semantic button types (.btn-primary, .btn-danger, etc.)</li>
                <li>Always associate labels with form inputs</li>
                <li>Test components in both light and dark modes</li>
                <li>Use proper spacing system (multiples of 4px)</li>
                <li>Provide focus states for keyboard navigation</li>
                <li>Use semantic color for status indicators</li>
              </ul>
            </div>
            <div>
              <h5 className="mb-2">✗ DON'T</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Use inline styles instead of Tailwind classes</li>
                <li>Create custom colors outside the design system</li>
                <li>Use arbitrary spacing values (not multiples of 4px)</li>
                <li>Skip accessibility features (ARIA labels, focus states)</li>
                <li>Mix design systems or conventions</li>
                <li>Disable buttons without providing visual feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
