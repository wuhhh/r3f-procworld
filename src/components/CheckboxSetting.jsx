import IconTick from "./svg/IconTick";

export default function CheckboxSetting(props) {
  return (
    <label htmlFor={props.id} className='cursor-pointer flex items-center gap-x-2 '>
      <div className='w-[18px] aspect-square relative [&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-2 [&:has(:focus-visible)]:outline-offset-2 [&:has(:focus-visible)]:outline-yellow-300'>
        <input
          type='checkbox'
          name={props.name}
          id={props.id}
          checked={props.checked}
          onChange={props.onChange}
          className='absolute w-full h-full opacity-0 peer'
          tabIndex={props.tabIndex}
        />
        <IconTick className='opacity-0 transition peer-checked:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        <div className='w-[18px] aspect-square rounded-sm border border-cloud-pink'></div>
      </div>
      {props.label}
    </label>
  );
}
