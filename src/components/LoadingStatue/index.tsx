import React from 'react';
import AnimatedComponent from '../AnimatedComponent';
import SpinningStatue from '../../assets/animation/loading_statue.json';
import useDevice from '../../util/device';

const LoadingStatue = (props: { size?: number }) => {
  const { size } = props;
  const { isPad } = useDevice();
  const _size = size || 200 * (isPad ? 1.5 : 1);
  return (
    <AnimatedComponent
      source={SpinningStatue}
      loop
      autoPlay
      width={_size}
      height={_size}
    />
  );
};

export default LoadingStatue;
