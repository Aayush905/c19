import fetch from 'node-fetch';
import Link from 'next/link';
import { useState, useContext } from 'react';
import { Header, Label, Checkbox, Radio, Input, InputWithDropDown, Toggle } from '../components/Form';
import PageLayout from '../components/PageLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { LanguageContext } from '../components/LanguageSelector';
import registrationContent from '../content/registration';
import fahrenheitToCelcius from '../methods/fahrenheitToCelcius';
import celciusToFahrenheit from '../methods/celciusToFahrenheit';

function Registration({ phone, survey }) {
  /* one time questions */
  /* TODO: Move so separate component */
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [hasChanged, setHasChanged] = useState(true);

  /* each registration */
  const [exposure, setExposure] = useState([]);
  const [scale, setScale] = useState('°C');
  const [temperature, setTemperature] = useState('');
  const [temperatureValue, setTemperatureValue] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  /*TODO: Missing state handling for additional symptoms questions */
  const [distancing, setDistancing] = useState(null);
  const [state, setState] = useState(null);
  const [critical, setCritical] = useState(null);
  const [neighbourhood, setNeighbourhood] = useState(null);
  const [community, setCommunity] = useState(null);

  const { language } = useContext(LanguageContext);
  const content = registrationContent[language];

  const isFirst = true;
  const unit = isFirst ? '14 ' + content.unit.days : '24 ' + content.unit.hours;

  // console.log({
  //   c: scale === '°C' ? temperatureValue : fahrenheitToCelcius(temperatureValue),
  //   f: scale === '°C' ? celciusToFahrenheit(temperatureValue) : temperatureValue,
  // });

  if (!survey) {
    return (
      <PageLayout>
        <p>
          {content.expired.label}{' '}
          <Link href="/">
            <a className="text-indigo-600 hover:text-indigo-700">{content.expired.link}</a>
          </Link>
          .
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {showConfirmation && <ConfirmationModal language={language} close={() => setShowConfirmation(false)} />}
      <Header
        title={
          <div className="flex flex-wrap">
            <span className="flex-auto">
              {content.by} {phone}
            </span>
            <span className="text-gray-500">
              {new Date().toLocaleString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        }
      />
      <Label
        label={content.noChange.label.replace('{unit}', unit)}
        description={content.noChange.description.replace('{unit}', unit)}>
        <Radio label={content.noChange.options.no} checked={!hasChanged} onChange={() => setHasChanged(!hasChanged)} />
        <Radio label={content.noChange.options.yes} checked={hasChanged} onChange={() => setHasChanged(!hasChanged)} />
      </Label>
      {hasChanged && (
        <>
          <Label
            label={content.exposure.label.replace('{unit}', unit)}
            description={content.exposure.description.replace('{unit}', unit)}>
            {Object.keys(content.exposure.options).map(key => (
              <Radio
                key={key}
                label={content.exposure.options[key]}
                checked={exposure === key}
                onChange={() => setExposure(key)}
              />
            ))}
          </Label>
          <Label label={content.temperature.label.replace('{unit}', unit)}>
            <Radio
              checked={temperature === 'measured'}
              label={content.temperature.options.measured}
              onChange={() => setTemperature('measured')}
              description={
                <InputWithDropDown
                  value={temperatureValue}
                  placeholder={scale === '°C' ? '38' : '98'}
                  options={['°C', '°F']}
                  onSelectChange={({ id }) => setScale(id)}
                  onChange={({ value }) => {
                    setTemperature('measured');
                    setTemperatureValue(value);
                  }}
                />
              }
            />
            {['subjective', 'normal'].map(key => (
              <Radio
                label={content.temperature.options[key].label}
                description={content.temperature.options[key].description}
                checked={temperature === key}
                onChange={() => {
                  setTemperature(key);
                  setTemperatureValue('');
                }}
              />
            ))}
          </Label>
          <Label
            label={content.symptoms.label.replace('{unit}', unit)}
            description={content.symptoms.description.replace('{unit}', unit)}>
            {Object.keys(content.symptoms.options).map(key => (
              <Checkbox
                label={content.symptoms.options[key]}
                onChange={() => {
                  if (symptoms.includes(key)) {
                    setSymptoms(symptoms.filter(string => string !== key));
                  } else setSymptoms(symptoms.concat(key));
                }}
              />
            ))}
          </Label>
          {symptoms.map(symptom =>
            Object.keys(content.symptoms.additional).map(key => (
              <Label
                key={key}
                label={content.symptoms.additional[key].label.replace(
                  '{symptom}',
                  content.symptoms.options[symptom].toLowerCase()
                )}>
                {Object.keys(content.symptoms.additional[key].options).map(optionKey => (
                  <Radio
                    key={key + '-' + optionKey}
                    label={content.symptoms.additional[key].options[optionKey]}
                    checked={false}
                    onChange={() => null}
                  />
                ))}
              </Label>
            ))
          )}
          <Label label={content.distancing.label.replace('{unit}', unit)}>
            {Object.keys(content.distancing.options).map(key => {
              const label = content.distancing.options[key];
              const optionProps = { label, onChange: () => setDistancing(key), checked: key === distancing };
              return <Radio {...optionProps} />;
            })}
          </Label>
          <Label label={content.state.label}>
            {Object.keys(content.state.options).map(key => {
              const label = content.state.options[key];
              const optionProps = { label, onChange: () => setState(key), checked: key === state };
              return <Radio {...optionProps} />;
            })}
          </Label>
          {state === 'work' && (
            <Label label={content.critical.label}>
              {Object.keys(content.critical.options).map(key => {
                const label = content.critical.options[key];
                const optionProps = { label, onChange: () => setCritical(key), checked: key === critical };
                return <Radio {...optionProps} />;
              })}
            </Label>
          )}
          <Label label={content.neighbourhood.label}>
            {Object.keys(content.neighbourhood.options).map(key => {
              const label = content.neighbourhood.options[key];
              const optionProps = { label, onChange: () => setNeighbourhood(key), checked: key === neighbourhood };
              return <Radio {...optionProps} />;
            })}
          </Label>
          <Label label={content.community.label}>
            {Object.keys(content.community.options).map(key => {
              const label = content.community.options[key];
              const optionProps = { label, onChange: () => setCommunity(key), checked: key === community };
              return <Radio {...optionProps} />;
            })}
          </Label>

          <div className="pt-5">
            <div className="flex justify-end">
              <p className="mt-2 text-xs font-normal text-red-600">{error}</p>
              <span className="ml-3 inline-flex rounded-md shadow-sm">
                <button
                  onClick={async e => {
                    setSaving(true);
                    e.preventDefault();
                    const response = await fetch('/api/post/survey', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        value: {
                          country,
                          age,
                          exposure,
                          exposureDate,
                          symptoms,
                          scale,
                          temperature,
                          temperatureValue,
                          tested,
                          state,
                        },
                        survey,
                      }),
                    });
                    if (response.ok) setShowConfirmation(true);
                    else setError('An unexpected error occured. Please try again.');
                    setSaving(false);
                  }}
                  type="submit"
                  className="relative inline-flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out">
                  <LoadingSpinner
                    size={16}
                    color="white"
                    className={saving ? 'absolute inset-0 h-full flex items-center' : 'hidden'}
                  />
                  <span className={saving ? 'invisible' : ''}>{content.submit}</span>
                </button>
              </span>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

export async function getServerSideProps(context) {
  const db = require('../db');
  const secret = process.env.SECRET;
  const { survey } = context.query;
  const { phone, value } = await db.task(async t => {
    const { person, value } =
      (await t.oneOrNone(
        `SELECT *
        FROM survey
        WHERE id = $/id/`,
        { id: survey }
      )) || {};
    if (!person) return {};
    const { phone } = await db.oneOrNone(
      `SELECT PGP_SYM_DECRYPT(phone::bytea, $/secret/) as phone
      FROM person
      WHERE id = $/id/`,
      { secret, id: person }
    );
    return { phone, value };
  });
  if (phone) {
    return {
      props: {
        phone: '*'.repeat(phone.substr(0, phone.length - 4).length) + phone.substr(phone.length - 4),
        survey,
        submitted: value !== null,
      },
    };
  } else return { props: {} };
}

export default Registration;
