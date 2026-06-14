# OpenMars Project TODO

## Phase 1: Core Calculator & Visualizations

### Mission Input & Calculator
- [x] Mission Input Form with Payload Mass, Dry Mass, Mission Delta-v inputs
- [x] Engine Type selector (Chemical, NTP, NEP) with preloaded Isp values
- [x] Custom Isp input option
- [x] Rocket Equation Calculator (Mass Ratio, Initial Mass, Final Mass, Propellant Mass, Propellant Fraction, Payload Fraction)
- [x] Results Dashboard with summary cards

### Visualizations
- [x] Propellant vs Dry Mass pie chart (Chart.js/Recharts)
- [x] Engine Comparison bar chart
- [x] Mass Fraction graph

### Mission Comparison Mode
- [x] Side-by-side comparison UI (Chemical vs NTP, Chemical vs NEP, NTP vs NEP)
- [x] Comparison calculations and display

## Phase 2: Mars Mission Planner & PDF Reports

### Mars Mission Planner (V2)
- [x] Launch Year selector
- [x] Transfer Type selector (Fast, Hohmann)
- [x] Estimated Travel Time calculation
- [x] Delta-v Requirement calculation
- [x] Mission Architecture summary

### PDF Report Generation
- [ ] PDF export functionality with mission inputs
- [ ] Include calculated results in PDF
- [ ] Include charts in PDF
- [ ] Include conclusions in PDF

## Phase 3: Orbital Mechanics Simulator (Foundation)

### Orbital Mechanics Simulator (V3 Foundation)
- [ ] 2D animated visualization
- [ ] Earth orbit rendering
- [ ] Mars orbit rendering
- [ ] Transfer trajectory animation
- [ ] Radiation exposure model (future enhancement)

## Design & Polish
- [x] Elegant, premium UI design with refined typography
- [x] Responsive layout for desktop and tablet
- [x] Smooth animations and micro-interactions
- [x] Consistent color palette and visual hierarchy
- [ ] Accessibility compliance
- [ ] Cross-browser testing

## Deployment
- [x] Vercel deployment configuration (vercel.json)
- [x] Serverless API entry point
- [x] Vercel-specific build scripts
