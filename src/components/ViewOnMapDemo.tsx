import { ViewOnMap } from './original';

export default function ViewOnMapDemo() {
  return (
    <div className="p-4 flex items-center justify-center">
      <ViewOnMap
        locationName="Big Belly Burger"
        address="75 Charles St, Boston, MA 02114"
      />
    </div>
  );
}
