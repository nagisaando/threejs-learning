// value: the value you want to remap
// originMin and originMax: the start and end of the original range (the part that you want to transform into another range)
// destinationMin and destinationMax: the start and end of the destination range (in our case it’s just 0 and 1, but we could have had a different destination range)
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}