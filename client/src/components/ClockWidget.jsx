import React from "react";
import { render } from "react-dom";
import '../css/clock.css'
import '../css/base.css'

export default class ClockWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    };
    this.tick = this.tick.bind(this);
    this.intervalId = null;
  }

  componentDidMount() {
    this.intervalId = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  tick() {
    this.setState({ date: new Date() });
  }

  render() {
    const { date } = this.state;
    const { type } = this.props;

    let hours = date.toLocaleString('en-US', { hour: 'numeric', hour12: true })

    let hoursNums = hours.length > 4 ? hours.slice(0, 2) : hours.slice(0, 1);
    hoursNums = (hoursNums < 10) ? `${hoursNums}` : hoursNums;

    let amPm = hours.slice(hours.length - 2)

    let minutes = date.toLocaleString('en-US', { minute: 'numeric' })
    minutes = (minutes < 10) ? `0${minutes}` : minutes;

    let seconds = date.toLocaleString('en-US', { second: 'numeric' })
    seconds = (seconds < 10) ? `0${seconds}` : seconds;

    let weekday = date.toLocaleString('en-US', { weekday: "long" })
    let day = date.toLocaleString('en-US', { day: "numeric" })
    let month = date.toLocaleString('en-US', { month: "long" })
    let year = date.toLocaleString('en-US', { year: "numeric" })

    let utc = date.toUTCString();
    let stringDate = utc.split(' ').slice(0, 4).join(' ')
    let currentZone = utc.slice(utc.length - 3)
    let space = <div className="spacer" data-width="digits"></div>

    let containerStyle, cardStyle, tabHeader;
    if (type === 'tab') {
      containerStyle = "tab-card w-100";
      cardStyle = "time tab-container grid-auto-1ft-row gap-2"
    } else {
      containerStyle = "span-6-center"
      cardStyle = "time container grid-auto-1ft-row gap-2"
    }

    return (
      <div className={containerStyle} style={{
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {tabHeader}
        <div className={cardStyle} style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: 'clamp(12px, 3vw, 16px)',
        }}>
          <div className="space-between flex-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 12px)',
          }}>
            <span className="day" style={{
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              fontWeight: 600,
              wordWrap: 'break-word',
            }}>
              {weekday}
            </span>
            <div className="flex-row end" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              <div className="date flex-row gap-0-6" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 1.5vw, 10px)',
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontWeight: 500,
              }}>
                {month} <span className="date-box" style={{
                  padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px)',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  minHeight: 44,
                  minWidth: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}>{day}</span>
              </div>
            </div>
          </div>
          <div className="flex-row space-between baseline" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 12px)',
            marginTop: 'clamp(8px, 2vw, 12px)',
          }}>
            <div className="flex-row gap-0-3 digits" style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'clamp(4px, 1vw, 8px)',
              fontSize: 'clamp(32px, 8vw, 64px)',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              <span className="time-digits" style={{
                fontSize: 'clamp(32px, 8vw, 64px)',
                fontWeight: 700,
              }}>
                {hoursNums}
              </span>
              <span className="light" style={{
                opacity: 0.6,
                fontSize: 'clamp(32px, 8vw, 64px)',
              }}>
                :
              </span>
              <span className="time-digits" style={{
                fontSize: 'clamp(32px, 8vw, 64px)',
                fontWeight: 700,
              }}>
                {minutes}
              </span>
              <span className="light seconds" style={{
                opacity: 0.6,
                fontSize: 'clamp(24px, 6vw, 48px)',
              }}>
                :
              </span>
              <span className="time-digits seconds" style={{
                fontSize: 'clamp(24px, 6vw, 48px)',
                fontWeight: 700,
              }}>
                {seconds}
              </span>
              <div className="spacer" data-width="15" style={{
                width: 'clamp(8px, 2vw, 15px)',
              }}></div>
            </div>
            <span className="digits-sm ampm" style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              {amPm}
            </span>
          </div>
        </div>
      </div>
    )
  }
}